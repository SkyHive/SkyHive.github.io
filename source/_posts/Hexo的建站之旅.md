---
title: Hexo的建站之旅
date: 2017-02-14 17:54:35
categories: Blog
tags: 
---
 这几天觉得wordpress作为博客实在是太臃肿了，而且访问的后台以及更新都极其的慢，以至于想把博客迁到Hexo上去。
Hexo 是个简洁快速且高效的博客框架，是个台湾的学生写的，所以对中文还是挺友好的，我们用起来也很方便，而且Hexo仅依赖node，易于安装。
首先准备的工具仅需要node.js,git即可，在ubuntu上安装这两样工具也是极其简单：
<!--more-->
```
sudo apt-get install nodejs
sudo apt-get install npm	
sudo apt-get install nodejs-legacy 			#由于ubuntu仓库中本来就有一个node，所以在ubuntu下nodejs命令不是node而是nodejs，但是安装nodejs-legacy后就可以解决这个问题了，具体为什么我也不知道
sudo apt-get install git
```
下面开始安装Hexo:
```
sudo npm install -g hexo-cli
```
安装完成后就可以部署博客了，根据Hexo官网上的步骤：
```
hexo init <floder>
cd <floder>
sudo nmp install		#安装依赖包
```
下面可以安装一些插件，大家可以根据不同的需要安装，网上都有教程，我就不赘述了，但是有一个插件是需要安装的：
```
npm install hexo-deployer-git --save 			#这是一个可以自动部署到github上的插件
```
接下来的配置可以参考官网上给出的配置详解，自己根据需要去手动配置，至于主题可以在Hexo提供的[网站](https://hexo.io/themes/)选择，然后从github上clone到themes下。配置完成后可以执行一下命令：
```
hexo clean
hexo generate 			#这个命令用于部署网页的静态文件，每次修改后都应该首先执行这条命令
```
如果想先预览网页效果的话，可以执行：
```
hexo s				#s即server,执行完成后可以在localhost:4000下预览
```

下面需要部署github端了，首先在你的github上创建一个仓库，仓库名必须为"username.github.io"，其中"username"为你的用户名，创建完成后写一个README使github自动帮你创建github pages

接着在你的终端配置git:
```
git config --global user.name "你github的username"
git config --global user.email "你的github邮箱"
```

然后生成密钥：
```
ssh-keygen -t rsa -C "你的邮箱"
```
回车确认，输入密码再确认，然后前往提示信息的目录下会有两个文件，其中id_rsa是私钥，id_rsa.pub是公钥
然后添加生成的key：
```
ssh-add id_rsa
```
然后将id_rsa.pub中的内容（除去最后你邮箱的那部分）复制下来，在你github主页中找到settings中的SSH Keys，将复制的公钥添加进去，title随便取个名字就好。
最后我们只要把Hexo生产的网页部署到github上就可以了，来到我们创建的博客目录，打开配置文件，在Deployment中配置：
```
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy: 
  type: git
  repository: https://github.com/username/username.github.io
  branch: master
```
同样的，"username"是你github的用户名
然后在博客根目录执行：
```
hexo generate 
hexo deploy			#部署博客到github
```
输出一下信息便说明我们部署成功：
```
INFO Deploy done:git
```
