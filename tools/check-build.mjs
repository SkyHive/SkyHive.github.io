import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('public');
const required = [
  'index.html',
  'about/index.html',
  'archives/index.html',
  'categories/index.html',
  'tags/index.html',
  'sitemap.xml',
  'atom.xml',
  'search.json',
  'css/index.css',
  'js/main.js',
  'assets/charts/maps/world_cn.json',
];

async function requireOutput(relativePath) {
  const file = path.resolve(output, relativePath);
  assert(file.startsWith(`${output}${path.sep}`), `Invalid output path: ${relativePath}`);
  assert((await stat(file)).size > 0, `Empty output: ${relativePath}`);
}

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(file);
    else yield file;
  }
}

try {
  for (const file of required) await requireOutput(file);

  const search = JSON.parse(await readFile(path.join(output, 'search.json'), 'utf8'));
  assert(Array.isArray(search) && search.length > 0, 'Search index must contain entries');

  // The chart plugin can log a warning and finish successfully if a download fails.
  const map = JSON.parse(await readFile(path.join(output, 'assets/charts/maps/world_cn.json'), 'utf8'));
  assert(map.type === 'FeatureCollection' && Array.isArray(map.features) && map.features.length > 0,
    'The about page requires a valid world-cn map');

  // Keep existing article URLs stable and catch abbrlink collisions before publishing.
  const links = new Map();
  for await (const file of walk('source/_posts')) {
    if (!file.endsWith('.md')) continue;
    const source = await readFile(file, 'utf8');
    const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    assert(frontMatter !== undefined, `Missing front matter: ${file}`);
    if (/^published:\s*false\s*(?:#.*)?$/m.test(frontMatter)) continue;
    // This blog uses CRC32 hexadecimal abbrlinks, optionally quoted in YAML.
    const link = frontMatter.match(/^abbrlink:\s*["']?([a-fA-F0-9]+)["']?\s*(?:#.*)?$/m)?.[1];
    assert(link, `Missing or invalid abbrlink: ${file}`);
    assert(!links.has(link), `Duplicate abbrlink ${link}: ${links.get(link)} and ${file}`);
    links.set(link, file);
    await requireOutput(`post/${link}.html`);
  }
  assert(links.size > 0, 'No published articles found');

  for await (const file of walk(output)) {
    assert(!file.endsWith(':Zone.Identifier'), `Unexpected Windows metadata: ${file}`);
  }
  console.log(`Build verified: ${required.length} required files, ${links.size} article URLs, valid search index.`);
} catch (error) {
  console.error(`Build verification failed: ${error.message}`);
  process.exitCode = 1;
}
