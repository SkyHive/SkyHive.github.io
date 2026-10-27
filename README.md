# SkyHive's Blog

Hexo + Butterfly，源码主分支为 `hexo`，由 Vercel 项目 `skyhive-blog` 自动构建并部署到 <https://blog.skyhive.tech>。

## 本地开发

使用 Node.js 22 和 pnpm 10.28.0。安装 pnpm 时遵循 `package.json` 的 `packageManager`，不要使用其他版本重新生成锁文件。

```sh
git clone --recurse-submodules https://github.com/SkyHive/SkyHive.github.io.git
cd SkyHive.github.io
nvm use
npx --yes pnpm@10.28.0 install --frozen-lockfile
npm run dev
```

对于已有 checkout，先执行 `git submodule update --init --recursive`。主题固定在 Git 记录的提交；日常构建不要执行 `git submodule update --remote`。

提交前运行：

```sh
npm run build
```

构建会清理旧产物，生成站点，并检查关键页面、CSS/JS、搜索索引和每篇已发布文章的链接，检测重复 abbrlink。`public/` 不提交到 Git。

正文与标题使用系统中文/西文字体，代码使用系统等宽字体，不额外下载全站中文字体。

Font Awesome 保留原图标外观，构建时由 `tools/build-icons.mjs` 从固定版本的包中自动生成本地 WOFF2 子集与精简 CSS。扫描范围包括主题模板、动态按钮脚本、文章和配置，以及主题 CSS 的伪元素图标；生成文件不提交 Git。裁剪后的字体使用独立名称，并随部署附带原始授权文件。`scripts/local-icon-fonts.js` 将主题的伪元素字体名称指向本地子集，无需修改主题子模块。

新增图标或升级主题后运行 `npm run build` 即会重新生成；构建检查会验证已生成页面中使用的图标字形确实存在。只单独重建图标时运行 `npm run build:icons`。

## Git 与发布

- 日常修改从 `hexo` 创建短期分支，通过 PR 合并。文章、主题、配置和依赖变更都先检查 Vercel Preview。
- `vercel.json` 定义安装、构建、输出目录和预览构建规则，避免配置只存在于控制台。所有分支均允许构建，生产发布仍由 Vercel 的 Production Branch 决定，应保持为 `hexo`。
- 在 GitHub 为 `hexo` 配置分支保护，将实际出现的 Vercel 构建检查设为合并条件。检查名称以 PR 中显示的名称为准。
- `master` 是旧 GitHub Pages 产物分支，不再通过 `hexo deploy` 更新。未核实旧 Pages 配置前保留该分支及 `source/CNAME`，避免破坏可能仍存在的入口。
- 锁文件与依赖声明一起提交。更新 pnpm 时，同时修改 `packageManager`、`engines.pnpm` 和 `vercel.json` 中的固定版本，并验证构建。
- 依赖安装脚本默认禁用；`@parcel/watcher`、`hexo-util` 及干净安装中发现的 `ejs`、`fsevents`、`highlight.js` 脚本显式记录为忽略，不批量放开脚本执行权限。

## 部署验证与恢复

1. PR 的 Preview 构建成功后，查看首页、文章、分类、搜索、图表和手机布局。
2. 合并后，在 Vercel 确认生产部署为 `READY`、源码 SHA 与合并提交一致、生产域名已分配。
3. 访问生产首页和新增文章。构建成功不能替代浏览器功能验证。
4. 页面异常时，在 Vercel 的 Deployments 中回滚到已验证的生产部署；同时修复或 revert 对应源码，防止下次发布重复引入问题。
5. 回滚可能暂停后续部署的自动域名分配；修复后检查自动上线状态，按 Vercel 提示恢复或 promote 正确的生产部署。

图表插件在构建时下载地图数据，外部服务不可用会影响构建。产物检查会验证关于页面使用的 `world_cn.json`，地图缺失、损坏或为空时阻止发布，避免插件仅输出警告后发布残缺页面。失败时查看 `[Charts]` 日志。

## 凭据与本地文件

- 不提交 Token、Access Key、Secret Key 或 `.env` 文件；Vercel 环境变量通过控制台管理。
- 旧七牛凭据已从当前配置删除。如果这些凭据曾真实使用，必须在七牛控制台撤销或轮换；删除文件内容不能撤销凭据，也不能清除历史提交或已有副本。
- 不自动改写已发布 Git 历史；确需历史清理时，先完成密钥轮换，再协调所有 checkout 和远程引用。
- `.vercel/`、构建缓存和 Windows `Zone.Identifier` 元数据不进入 Git 或部署产物。
