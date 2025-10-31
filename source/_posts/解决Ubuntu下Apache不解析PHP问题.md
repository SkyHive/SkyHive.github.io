---
title: 解决 Ubuntu 下 Apache 不解析 PHP 问题
categories: 技术相关
tags:
  - linux
  - apache
abbrlink: d0b9a1b4
date: 2017-07-13 20:00:22
---
这两天笔者遇到了一个很操蛋的问题——Apache 无法解析 PHP 代码了，之前一直用的挺好的，突然就挂了，然后在网上疯狂的找解决办法，但是大都是 `PHP5` 的版本，而我却是 `PHP7` 的版本，我就先顺便把5版本的解决方法贴出来：

对 `httpd.conf` 配置文件做如下调整：

1. 在 `AddType application/x-gzip .gz .tgz` 该行下面添加 `AddType application/x-httpd-php .php`
2. 将 `DirectoryIndex index.html` 修改成 `DirectoryIndex index.html index.htm index.php`
3. 将 `#ServerName www.example.com:80` 改成 `ServerName localhost:80`

然而 Ubuntu 下的 Apache 并没有 `httpd.conf` 这个配置文件，而是通过一个 `apache2.conf` 来引用每个部分的配置文件，这样在一个配置包里找到那一句配置也并不简单，而且我还没有找到。。。

不过皇天不负有心人，终于是找到了解决办法：

```shell
sudo apt-get install libapache2-mod-php
```

这一步安装了 `Apache` 的扩展包，可以用于解析 `PHP`，我觉得不管是 7 版本还是 5 版本都可以适用。
