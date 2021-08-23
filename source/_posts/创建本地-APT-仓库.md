---
title: 创建本地 APT 仓库
date: 2021-08-23 17:21:11
categories: Infra
tags:
- Ubuntu
---
### 背景
由于部分客户场景无法联通外网，而 MAAS 在部署镜像的过程中，会默认连接 http://archive.ubuntu.com/ubuntu 的源去安装一些依赖包，在无外网环境下，会导致部署失败！因此考虑将 MAAS 在部署过程中的依赖包提前下载好，做成本地的 APT 仓库来解决。
由于 MAAS 需要安装的依赖包并不多（一共 260M 左右），并不需要使用 apt-mirror 去搭建完整的 apt 仓库，我们将需要的依赖包都下载好，使用 apt-fptarchive 来发布我们的仓库。

<!--more-->

### 仓库制作
```bash
sudo -i
 
## 先删除本地的缓存的 deb 包
rm -rf /var/cache/apt/archives/*.deb
 
## 下载依赖包
apt -d install -y amd64-microcode crda freeipmi-common freeipmi-tools grub-common grub-gfxpayload-lists grub-pc-bin grub-pc grub2-common intel-microcode ipmitool iucode-tool iw libdbus-glib-1-2 libevdev2 libfreeipmi17 libimobiledevice6 libipmiconsole2 libipmidetect0 libmysqlclient21 libnl-3-200 libnl-genl-3-200 libnvpair1linux libplist3 libsensors-config libsensors5 libsnmp-base libsnmp35 libupower-glib3 libusbmuxd6 libuutil1linux libzfs2linux libzpool2linux linux-firmware linux-generic linux-headers-5.4.0-77-generic linux-headers-5.4.0-77 linux-headers-generic linux-image-5.4.0-77-generic linux-image-generic linux-modules-5.4.0-77-generic linux-modules-extra-5.4.0-77-generic lldpd mysql-common os-prober python3-bcrypt python3-paramiko python3-pyudev python3-yaml smartmontools thermald upower usbmuxd wireless-regdb zfsutils-linux

 
## 创建仓库目录
mkdir /opt/repo/pool/main -p
mv /var/cache/apt/archives/*.deb /opt/repo/pool/main/
 
## 开始创建
### 生成公钥和私钥
root@hyperx:~# gpg --full-generate-key
gpg (GnuPG) 2.2.19; Copyright (C) 2019 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
 
Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
  (14) Existing key from card
Your selection? 4
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 1024
Requested keysize is 1024 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) y
 
GnuPG needs to construct a user ID to identify your key.
 
Real name: hyperx 
Email address: hyper@hyperx.com
Comment:
You selected this USER-ID:
    "hyper@hyperx.com"
 
Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? o
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
 
### key 的类型选择 RSA （sign only）
### keyzise 选择 1024
### 过期时间选择 0 （永不过期）
### 最后填上 Real name 和 Email address
### 完成后会要求设置私钥密码，后续导出私钥或者用私钥进行签名都会用到该密码！
### 可以使用 gpg -k 来查看当前的 gpg key 信息
root@hyperx:~# gpg -k
/root/.gnupg/pubring.kbx
------------------------
pub   rsa1024 2021-08-19 [SC]
      D923B3893E0AB27C3690696CFC3E8D5996EBB76F
uid           [ultimate] hyperx <hyperx@hyperx.com>
 
cd /opt/repo/
gpg -a --export hyperx@hyperx.com > hyperx.pub  ## 导出公钥，后续需要将内容复制到 MAAS 上
gpg -a --export-secret-keys hyperx@hyperx.com > hyperx.sec    ## 导出私钥
 
mkdir -p dists/focal/main/binary-amd64
apt-fptarchive  packges /opt/repo/pool/main/ > dists/focal/Packages
cd dists/focal/
gzip -c Packages > Packages.gz
cp Packages* main/binary-amd64/
apt-ftparchive release . > Release
gpg -abs -o Release.gpg Release
gpg --clearsign -o InRelease Release
 
### 创建 backports/proposed/security/updates 目录
### 因为我们只是为了安装上述的依赖包从而完成部署流程，因此这几个目录只是用来骗过 ubuntu 的，直接从 focal copy 即可
### proposed 是 src 源，不搞也可以
cp -r focal focal-backports
cp -r focal focal-proposed
cp -r focal focal-security
cp -r focal focal-updates
 
## 通过 Nginx 发布 HTTP 服务
apt install -y nginx
sed -e $'/server_name _/a\ \ \ \ \ \ \ \ autoindex on;' /etc/nginx/sites-available/default    ## 打开 autoindex
nginx -t    ## 检查配置语法问题
nginx -s reload     ## 加载 nginx 配置
cd /var/www/html
mv /opt/repo ./
```

### 修改 MAAS Package repos 配置
如果客户环境连不到外网，那么我们在部署之前需要修改一下 maas 的配置
1. 登录至 maas web 控制界面
2. 定位置至 Settings → Package repos
3. 修改 Ubuntu archive URL 为 http://maas_ip/repo/；并将之前导出的 hyperx.pub 内容粘贴至  Ubuntu archive  Key 中，保存