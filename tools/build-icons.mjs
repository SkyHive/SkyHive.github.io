import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, readdir, mkdir, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import fonteditor from 'fonteditor-core';

const require = createRequire(import.meta.url);
const upstream = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));
const output = path.resolve('source/assets/fontawesome');
const iconNames = new Set();
const unicodes = new Set();

async function scan(file) {
  if (path.resolve(file) === output) return;
  const entries = await readdir(file, { withFileTypes: true }).catch(() => null);
  if (entries) {
    for (const entry of entries) await scan(path.join(file, entry.name));
  } else if (/\.(?:pug|js|mjs|styl|css|yml|yaml|md|html)$/.test(file)) {
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(/\bfa-[a-z0-9-]+/g)) iconNames.add(match[0]);
    // Butterfly also inserts icons through CSS pseudo-elements, without classes.
    for (const match of text.matchAll(/\\([ef][a-f0-9]{3})\b/gi)) unicodes.add(parseInt(match[1], 16));
  }
}

for (const file of ['themes/butterfly/layout', 'themes/butterfly/scripts', 'themes/butterfly/source',
  'source', '_config.yml', '_config.butterfly.yml']) await scan(file);

const css = postcss.parse(await readFile(path.join(upstream, 'css/all.css'), 'utf8'));
const supportedClasses = new Set();
css.walkRules(rule => {
  for (const match of rule.selector.matchAll(/\.([a-z0-9-]+)/g)) supportedClasses.add(match[1]);
});
const unsupported = [...iconNames].filter(name => !supportedClasses.has(name));
assert.equal(unsupported.length, 0, `Unsupported Font Awesome classes: ${unsupported.join(', ')}`);
const included = new Set();
const iconCodepoints = {};
css.walkRules(rule => {
  const glyph = rule.nodes.find(node => node.type === 'decl' && node.prop === '--fa');
  if (!glyph) return;
  const names = [...rule.selector.matchAll(/\.([a-z0-9-]+)/g)].map(match => match[1]);
  if (!names.some(name => iconNames.has(name))) {
    rule.remove();
    return;
  }
  names.forEach(name => included.add(name));
  for (const match of glyph.value.matchAll(/\\([a-f0-9]{1,6})/gi)) {
    const codepoint = parseInt(match[1], 16);
    unicodes.add(codepoint);
    names.forEach(name => { iconCodepoints[name] = codepoint; });
  }
});
assert(included.size > 0, 'No icon classes found');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await fonteditor.woff2.init();
const fonts = {};
for (const [style, weight, family] of [
  ['solid', 900, 'SkyHive Icons'], ['regular', 400, 'SkyHive Icons'], ['brands', 400, 'SkyHive Brands'],
]) {
  const input = await readFile(path.join(upstream, `webfonts/fa-${style}-${weight}.ttf`));
  const font = fonteditor.createFont(input, { type: 'ttf', subset: [...unicodes], hinting: false });
  const data = font.get();
  // Modified fonts have independent names; retain upstream copyright/license fields.
  Object.assign(data.name, {
    fontFamily: family, fontSubFamily: style, fullName: `${family} ${style}`,
    uniqueSubFamily: `${family}-${style}`, postScriptName: `${family.replaceAll(' ', '')}-${style}`,
    preferredFamily: family, preferredSubFamily: style,
  });
  const buffer = font.write({ type: 'woff2', hinting: false });
  const digest = createHash('sha256').update(buffer).digest('hex').slice(0, 12);
  const filename = `${style}.${digest}.woff2`;
  await writeFile(path.join(output, filename), buffer);
  const encoded = fonteditor.createFont(buffer, { type: 'woff2' }).get();
  fonts[style] = { filename, bytes: buffer.length, unicodes: Object.keys(encoded.cmap).map(Number) };
}

css.walkAtRules('font-face', face => {
  const family = face.nodes.find(node => node.prop === 'font-family')?.value.replace(/["']/g, '');
  if (!['Font Awesome 6 Free', 'Font Awesome 6 Brands'].includes(family)) {
    face.remove(); // Unused v4/v5 compatibility faces must not download full fonts.
    return;
  }
  const src = face.nodes.find(node => node.prop === 'src');
  const style = src.value.match(/fa-(solid|regular|brands)-/)?.[1];
  assert(fonts[style], `Unknown icon font: ${src.value}`);
  src.value = `url("./${fonts[style].filename}") format("woff2")`;
  face.nodes.find(node => node.prop === 'font-display').value = 'swap';
});
const stylesheet = css.toString().replaceAll('Font Awesome 6 Free', 'SkyHive Icons')
  .replaceAll('Font Awesome 6 Brands', 'SkyHive Brands');
await writeFile(path.join(output, 'fontawesome-subset.css'), stylesheet);
await copyFile(path.join(upstream, 'LICENSE.txt'), path.join(output, 'LICENSE.txt'));
await writeFile(path.join(output, 'manifest.json'), JSON.stringify({
  version: '6.7.1', icons: [...included].sort(), iconCodepoints, fonts,
}, null, 2) + '\n');
console.log(`Icons: ${included.size} classes; ${Object.values(fonts).reduce((sum, font) => sum + font.bytes, 0)} font bytes.`);
