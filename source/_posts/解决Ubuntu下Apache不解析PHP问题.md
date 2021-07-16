---
title: 解决Ubuntu下Apache不解析PHP问题
date: 2017-07-13 20:00:22
categories: Infra
tags:
- Linux
- Apache
---
这两天笔者遇到了一个很操蛋的问题——Apache无法解析PHP代码了，之前一直用的挺好的，突然就挂了，然后在网上疯狂的找解决办法，但是大都是php5的版本，而我却是7的版本，我就先顺便把5版本的解决方法贴出来：

>修改apache的配置文件httpd.conf
<!--more-->
>在httpd.conf中找到：
`AddType application/x-gzip .gz .tgz`
在该行下面添加
`AddType application/x-httpd-php .php`

>再找继续找到：
`DirectoryIndex index.html`，
把此行修改成
`DirectoryIndex index.html index.htm index.php`

>再找到：
`#ServerName www.example.com:80`
改成
`ServerName localhost:80`

然而Ubuntu下的Apache并没有httpd.conf这个配置文件，而是通过一个apache2.conf来引用每个部分的配置文件，这样在一个配置包里找到那一句配置也并不简单，而且我还没有找到。。。

不过皇天不负有心人，终于是找到了解决办法：
```
sudo apt-get install libapache2-mod-php
```
这一步安装了apache的扩展包，可以用于解析php，我觉得不管是7版本还是5版本都可以适用。

