---
title: Gitlab单节点服务搭建
date: 2021-07-25 12:25:01
categories: Linux
tags:
---
## 搭建准备
根据官方提供的说法，小规模使用 GitLab 只用单机部署即可，4C8G 的配置足够小一百人使用 Git，由于本次也只是熟悉一下 GitLab 的搭建过程和各组件之间的关系，所以就使用低配的虚拟机进行搭建了。
### 虚拟机配置
|CPU|内存|硬盘|
|---|---|---|
|4\*vCPU|8GB|200GB|

## 搭建过程
### 安装依赖
```
sudo apt update
sudo apt install curl openssh-server ca-certificates postfix
```

### 搭建服务
```
wget --content-disposition https://packages.gitlab.com/gitlab/gitlab-ce/packages/ubuntu/xenial/gitlab-ce_12.0.1-ce.0_amd64.deb/download.deb		## 下载官方 deb 包
sudo dpkg -i gitlab-ce_12.0.1-ce.0_amd64.deb

## 卸载原有 nginx
sudo apt purge nginx-common nginx-full

## 修改域名配置
sudo vim /etc/gitlab/gitlab.rb

external_url='your domain_name'

## 配置生效
sudo gitlab-ctl reconfigure
```

### 汉化
汉化的步骤实际上没有太大比较，GitLab 的汉化一直做的比较“晦涩难懂”，不如直接英语界面来的舒服。

```
## 去 https://gitlab.com/xhang/gitlab 找到对应版本的分支
wget https://gitlab.com/xhang/gitlab/-/archive/v12.0.1/gitlab-v12.0.1.tar.gz
tar -zxvf gitlab-v12.0.1.tar.gz ## 解压

sudo gitlab-ctl stop ## gitlab 停止服务

## 备份 gitlab-rails 目录，该目录下主要是web应用部分，也是当前项目仓库的起始版本，也是汉化包要覆盖的目录。
sudo tar zcvf /opt/gitlab/embedded/service/gitlab-rails-bak.tar.gz /opt/gitlab/embedded/service/gitlab-rails 
## 汉化包覆盖
sudo cp -rf ~/gitlab-v12.0.1/* /opt/gitlab/embedded/service/gitlab-rails/

sudo gitlab-ctl start 	## GitLab 启动服务

sudo gitlab-ctl reconfigure ## 重新配置
```

### 基操
```
## 查看 GitLab 状态
sudo gitlab-ctl status

## 查看 GitLab 版本
cat /opt/gitlab/embedded/service/gitlab-rails/VERSION

## GitLab 停止服务
sudo gitlab-ctl stop

## GitLab 启动服务
sudo gitlab-ctl start
```
