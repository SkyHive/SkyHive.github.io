---
title: 解决Ubuntu下PHP验证码不显示问题
date: 2017-07-14 16:41:26
categories: Infra
tags:
- PHP
- Ubuntu
---
这两天在帮别人写一个注册登录功能的页面，用到了简单的TP框架，但是在我自己的Ubuntu环境下发现验证码出了问题——验证码图片显示不出来。

我将图片单独拉出来，发现错误提示如下：
```
Call to undefined function imagecreate()
```
百度一问就找到了答案，原来这是由于没有安装或者开启PHP的GD库导致的，既然这样我只需要安装一下GD库就解决了：
```
sudo apt-get install php7.0-gd
```
安装完毕后将Apache服务器重启，如果是Nginx的话，则可用可不用

如果是Windows环境的话，打开PHP安装目录下的php.ini配置文件，找到：
```
;extension=php_gd2.dll
```
去掉注释，重启服务就解决了。

