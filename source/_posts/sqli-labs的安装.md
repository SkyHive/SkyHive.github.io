---
title: SQLi-Labs的安装
categories: 技术相关
tags:
  - MySQL
  - Security
abbrlink: a802aee5
published: false
date: 2017-02-09 13:24:18
---
笔者前段时间安装了 sqli-labs，就想把 sqli-labs 和 lamp 环境的搭建都写出来，其实这两个东西都很简单，感觉比我折腾 hexo 要简单的得多了（手动滑稽）。

sqli 即 sql injection(sql注入)，sqli-labs是一个印度程序员写的用来学习sql注入的游戏教程，[Youtube上有一套视频教程](https://www.youtube.com/playlist?list=PLkiAz1NPnw8qEgzS7cgVMKavvOAdogsro)(需要科学上网)，[github上也有开源的项目](https://github.com/Audi-1/sqli-labs)。

那么接下来就可以进行安装了：
<!--more-->
首先搭建lamp环境,我用的是ubuntu 16.04的系统

1.安装apache2

```
sudo apt-get install apache2
```

2.安装mysql

```
sudo apt-get install mysql-server
```

3.安装php7(ubuntu16.04开始支持php7.0，之前的版本可以只支持到php5)

```
sudo apt-get install php7.0
php7.0  -v      #查看版本信息，确认安装成功
```

4.整合php与mysql

```
sudo apt-get install php7.0-mysql
```

5.重启apache和mysql服务

```
sudo service apache2 restart
sudo service mysql restart
```

此时在浏览器输入localhost,便能显示apache的页面，也代表lamp环境到目前为止算是成功搭建完毕。

下面开始安装sqli-labs
先从github上克隆sqli-labs代码：

```
git clone https://github.com/Audi-1/sqli-labs.git
```

然后修改sqli-labs数据库配置文件：

```
vim sqli-labs/sql-connections/db-creds.inc      #编辑配置文件
修改如下：
<?php
//give your mysql connection username n password
$dbuser ='root';
$dbpass ='你数据库密码';
$dbname ="security";
$host = 'localhost';
$dbname1 = "challenges";
?>
```

然后将目录复制到apache的web目录：

```
sudo cp -r sqli-labs /var/www/html#默认是/var/www/html这个目录，也可以在apache的配置文件中修改目录
```

然后在浏览器中访问 [http://127.0.0.1/sqli-labs](http://127.0.0.1/sqli-labs)或者[http://localhost/sqli-labs](http://localhost/sqli-labs) 就能看到启动页面，点击页面中的`Setup/reset Database for labs`链接，让其进行安装。
