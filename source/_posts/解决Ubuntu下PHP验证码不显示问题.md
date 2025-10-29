---
title: 解决 Ubuntu 下 PHP 验证码不显示问题
categories: 技术相关
tags:
  - PHP
  - Ubuntu
abbrlink: 6c9a7abf
date: 2017-07-14 16:41:26
---
这两天在帮别人写一个注册登录功能的页面，用到了简单的 TP 框架，但是在我自己的 Ubuntu 环境下发现验证码出了问题——验证码图片显示不出来。

我将图片单独拉出来，发现错误提示如下：
```
Call to undefined function imagecreate()
```
百度一问就找到了答案，原来这是由于没有安装或者开启 PHP 的 GD 库导致的，既然这样我只需要安装一下 GD 库就解决了：
```
sudo apt-get install php7.0-gd
```
安装完毕后将 Apache 服务器重启，如果是 Nginx 的话，则可用可不用

如果是 Windows 环境的话，打开 PHP 安装目录下的 php.ini 配置文件，找到：
```
;extension=php_gd2.dll
```
去掉注释，重启服务就解决了。

