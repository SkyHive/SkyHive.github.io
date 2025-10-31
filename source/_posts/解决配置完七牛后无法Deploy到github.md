---
title: 解决配置完七牛后无法 Deploy 到 Github
categories: 技术相关
tags:
  - OSS
  - hexo
abbrlink: 662bd6d7
date: 2017-02-14 23:40:26
---
将七牛的插件配置好后我写了上一篇博客试一试效果，结果发现怎么也没部署到github，每次`hexo d`都会出现

```shell
ERROR Deployer not found: git
```

这样的报错，Google 了半天都没有找到解决的办法，最后在找到了 Github 上的一条 issue，终于发现了解决办法：**只要将配置文件_config.yml中plugins的那段给注释掉**就 OK 了，即

```yaml
#plugins:
#- hexo-qiniu-sync
```

还是希望开发者能早点修改文档吧，不然还真的挺容易出事，不过说一句，我的 Hexo 是 3.2.2 的版本的，不知道 2.x 版本会不会出现类似的情况
