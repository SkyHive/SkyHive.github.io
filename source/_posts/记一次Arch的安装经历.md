---
title: 记一次Arch的安装经历
categories: 技术相关
tags:
  - linux
  - Arch
abbrlink: ab2e3e73
date: 2017-02-13 17:57:58
---
最近由于听信了别人的“谗言”，心血来潮想试一试Arch，所以便准备在虚拟机上装一个Arch来看看效果，也算是一次艰难的装系统之路了吧。

那么下面打开虚拟机，进入安装界面：

首先是分区，Arch给我们提供了一个很好的分区交互工具cfdisk

```shell
cfdisk        #使用cfdisk进行分区

```
<!--more-->
*选择第二个 dos 类型*，这是将 sda 设置成 MBR 类型的分区，之前在遇到这个选项的时候，我下意识的选了第一个 GPT，然后还去 Google 了一下，说GPT很好,就使用这个吧，结果后面分区的时候和教程不一样，装好系统后怎么也进不去。

接下来你可以把整个硬盘设置成一个根分区或者分成一个根分区和一个 boot 分区。*如果设置成一个根分区记得要把那个分区设置 bootable；如果是一个根分区和一个 boot 分区记得要把 boot 分区设置 bootable。*

退出 `cfdisk` 后格式化新设置的分区

```shell
lsblk       #查看存储设备的状态，sda1、sda2这样的就是我们刚刚分出来的
mkfs.ext4 /dev/sda1
mkfs.ext4 /dev/sda2         #将根分区和boot分区格式化成ext4格式
```

然后就可以进行挂载了

```shell
mount /dev/sda2 /mnt           #将根分区挂载到/mnt
mkdir /mnt/boot         #为boot分区创建挂载点
mount /dev/sda1 /mnt/boot
```

接着修改软件镜像源

```shell
cd /etc/pacman.d        #镜像源文件在这个目录下
#我们需要将China源放到文件头的位置，下面先将这段源提取到temp这个文件里
grep -A 1 '##.*China' mirrorlist|grep -v '\-\-' > temp
#然后将mirrorlist的内容添加到temp的最后面
cat mirrorlist >> temp
mv temp mirrorlist         #temp替换mirrorlist
```

然后刷新软件仓库列表就可以开始安装了

```shell
pacman -Syy         #刷新软件仓库列表
pacstrap -i /mnt base base-devel        #安装系统
```

接下来需要生成一个叫 `fstab` 的配置文件，在开机时候会由 `mount` 命令读取并挂载其中的分区。在安装完基本系统之后，就可以将 `fstab` 信息写入新安装的系统中了。

```shell
genfstab -U -p /mnt >> /mnt/etc/fstab
nano /mnt/etc/fstab         #确认fstab文件真的生成了
```

下面我们就可以进入新系统进行配置了

```shell
arch-chroot /mnt /bin/bash
passwd          #设置root密码
echo 主机名 > /etc/hostname         #设置主机名
```

然后配置区域

```shell
nano /etc/locale.gen
```

将`en_US.UTF-8`、`zh_CN.UTF-8`、`zh_TW.UTF-8`的注释去掉，然后按Ctrl+x保存，退出，使用

```shell
locale-gen
```

生成区域，然后设置 `locale.conf` 文件

```shell
echo LANG=en_us.UTF-8 > /etc/locale.conf#如果在终端下使用中会出现乱码，可以装fbterm来解决
```

下面配置时区

```shell
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

安装引导工具 `Grub`

```shell
pacman -S grub
grub-install --recheck /dev/sda1        #将grub写入系统，没有提示错误说明写入成功
grub-mkconfig -o /boot/grub/grub.cfg        #生成配置文件
```

配置一下网络

```shell
systemctl enable dhcpcd.service
```

到现在为止，系统基本上配置好了，现在退出新系统，卸载挂载的分区，然后重启虚拟机

```shell
exit
umount -R /mnt
reboot
```

剩下来的安装图形化界面和美化的步骤可以自行 Google。
