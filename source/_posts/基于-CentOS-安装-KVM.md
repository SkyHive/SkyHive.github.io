---
title: 基于 CentOS 安装 KVM
categories: 技术相关
tags:
  - KVM
  - 虚拟化
abbrlink: 9411b67b
date: 2020-06-10 17:40:03
---
### 安装操作系统

UEFI 引导或者 Legacy BIOS 引导均可，冲就完事了
<!--more-->
### 安装 KVM 及其依赖

```bash
## 先把源换了
yum install -y wget
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
yum makecache

## 安装 epel 源
yum install -y epel-release

## 安装 KVM 以及依赖服务
yum install ntp kvm virt-manager virt-top qemu-kvm qemu-kvm-tools libvirt git vim htop
systemctl start libvirtd
systemctl enable libvirtd

## 配置 NTP
vim /etc/ntp.conf
--------
server ntp.aliyun.com iburst  # 新增
--------

systemctl start ntpd
systemctl enable ntpd
ntpq -p  # 检查同步状态

## 关闭 firewalled selinux
systemctl stop firewalld
systemctl disable firewalld
setenforce 0
vim /etc/sysconfig/selinux
-------
SELINUX=disabled  #修改
-------

## 修改 grub 引导配置
vim /etc/default/grub
-------
GRUB_CMDLINE_LINUX="crashkernel=auto spectre_v2=retpoline rd.lvm.lv=centos/root rd.lvm.lv=centos/swap intel_iommu=on rhgb quiet"  # 开启 intel iommu
-------
grub2-mkconfig -o /boot/grub2/grub.cfg
```

### 网络配置

因为环境需要将两个数据口创建 bond4 来使用，以下需要先创建 bond，再将 bond 加入网桥

```bash
## 安装依赖并禁用 NetworkManager
yum install -y bridge-utils
systemctl stop NetworkManager
systemctl disable NetworkManager

## eno1 配置文件修改
vim /etc/sysconfig/network-scripts/ifcfg-eno1
----------
DEVICE="eno1"
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=none
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=eno1
ONBOOT=yes
MASTER=bond1
SLAVE=yes
----------
 
 
## eno2 配置文件修改
vim /etc/sysconfig/network-scripts/ifcfg-eno2
----------
DEVICE="eno2"
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=none
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=eno2
ONBOOT=yes
MASTER=bond1
SLAVE=yes
----------
 
 
## bond1 配置添加
vim /etc/sysconfig/network-scripts/ifcfg-bond1
----------
TYPE=Bond
BOOTPROTO=none
ONBOOT=yes
USERCTL=no
DEVICE=bond1
NAME=bond1
BONDING_MASTER=yes
BONDING_OPTS="miimon=100 xmit_hash_policy=layer3+4 mode=4 lacp_rate=1"
BRIDGE=br1
----------
 
 
## br1 配置添加
vim /etc/sysconfig/network-scripts/ifcfg-br1
----------
TYPE=Bridge
BOOTPROTO=static
IPADDR=$ip
NETMASK=$netmask
GATEWAY=$gateway
PEEDNS=yes
NAME=br1
DEVICE=br1
ONBOOT=yes
DNS1=x.x.x.x
DNS2=x.x.x.x
----------
 
## 删除默认网桥
modprobe bonding
virsh net-destory default
```

### 设置虚拟机支持从 UEFI 启动

```bash
## 安装依赖
wget http://www.kraxel.org/repos/firmware.repo -O /etc/yum.repos.d/firmware.repo
yum makecache
yum install -y edk2.git-ovmf-x64 OVMF
 
## 配置 libvirtd
vim /etc/libvirt/qemu.conf  # 新增
--------
nvram = ["/usr/share/edk2.git/ovmf-x64/OVMF_CODE-pure-efi.fd:/usr/share/edk2.git/ovmf-x64/OVMF_VARS-pure-efi.fd"]
--------
systemctl restart libvirtd
 
## 后面创建虚拟机的时候可以在 firmware 中选择 uefi 了
```
