---
title: 琐事——换回Apache
date: 2017-01-15 20:03:30
categories: 
- Linux
tags:

---
由于之前在ubuntu上使用nginx总是会出现各种各样的问题，所以打算将自己机器上的nginx换成Apache，服务器上继续使用nginx，下面开始干活儿：
<!--more-->
首先将nginx完全卸载（包括配置文件)
```
sudo apt-get purge nginx
```
然后卸载不再需要nginx的依赖程序
```
sudo apt-get autoremove
```

卸载完成后就可以开始安装Apache 了
```
sudo apt-get install apache2
```
然后查看Apache的版本信息，确认安装完成
```
apache2 -v
Server version: Apache/2.4.18 (Ubuntu)
Server built:   2016-07-14T12:32:26
```
这个时候在浏览器里访问localhost就会出现一个Apache2 Ubuntu Default Page的页面，说明Apache已经可以正常工作了。下面在安装一个依赖包让Apache2可以解析php代码
```
sudo apt-get install libapache2-mod-php7.0
```
做到这里基本上就已经结束了，然后剩下的apache就不在多说了，文件就在etc/apache2/下。
