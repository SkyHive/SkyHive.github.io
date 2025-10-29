---
title: 关于 Ubuntu 循环登录界面
categories: 技术相关
tags:
  - Linux
  - Ubuntu
abbrlink: 93f970d9
date: 2018-04-20 12:36:21
---
其实事情的起因很奇怪，前两天一直想升级Ubuntu 18.04，不知道为什么17.10用着怪怪的，但是18.04又要到4月26号才发布，没有办法了只能Beta 2先用着试试了。

然后就是一顿正常的操作

<!--more-->

#### 从Ubuntu 17.10 升级到 18.04 Beta 2

```shell
# 先将当前系统更新
sudo apt update
sudo apt upgrade
#然后升级系统
sudo do-release-upgrade -d
```

然后就让系统自己去下载安装了，不过中途我在终端提示中看到了某个什么东西不可用，当然我也没有在意，估计更新到了正式版系统就没事了吧，结果这就埋下了伏笔。

#### 卡在了启动界面

没错，就是那个带着Ubuntu logo，然后logo下面还有几个小点点的那个界面，卡的死死的。ESC之后显示的状态应该是这样的

```
[Started] Gnome Display Manage
```

然后我当机立断的去Google了一下，不知道在哪里看到了一个答案是要进Recovery mode修复一下dpkg，做完之后我觉得这并不够，开在启动界面的事情我第一次装Ubuntu也是遇到过，我知道是显卡驱动的问题，然后不知道在哪看到的方法，把我Nvidia驱动给卸载掉了。

> 第一次装Ubuntu遇到这问题，解决的办法是在Ubuntu 高级选项中，对需要引导的内核按e进行编辑，在 `quiet splash `那一行后面加上`acpi_osi=linux nomodeset`，这个是针对N卡的，如果是A卡或者Intel核显有对应的解决办法

#### Ubuntu Login Loop

重启之后确实能度过了logo的那一关，但是新的问题又来了，这次能达到登录的界面，但是输入密码登录之后会黑屏一下又回到登录界面。

这个`Ubuntu Login Loop`的问题已经不新鲜了，之前每个版本都有人遇到过，而且引起的原因也各不相同，这次我遇到了这个坑就来稍微的总结一下

* `.Xauthority`文件的所有人和所有组变成了root：在你用户的主目录下有一个`.Xauthority`文件，用`ls -la`查看一下该文件的所有人和所有组，如果是root的话那么需要将其改为你的登录用户

  ```shell
  sudo chown username:username .Xauthority
  ```

* `/tmp`权限：用`ls -ld`查看一下`/tmp`的权限是否是`drwxrwxrwxt`，否则就将其权限修改

  ```shell
  sudo chmod a+wt /tmp
  ```

* 当然还有就是显卡驱动惹的祸：网上大部分人都是更新了显卡驱动才一直循环登录界面，而我就比较特殊了，我是卸载了显卡驱动，不过解决办法都是一样，就是重装显卡驱动呗

  ```shell
  #完全卸载N卡驱动
  sudo apt remove --purge nvidia*
  #关闭图形界面
  sudo service lightdm stop
  #禁用nouveau驱动
  #在/etc/modprobe.d/blacklist.conf中加入如下内容：
  blacklist nouveau
  options nouveau modeset=0
  #然后执行
  sudo update-initramfs -u
  #安装Nvidia驱动
  sudo add-apt-repository ppa:xorg-edgers/ppa #添加ppa源
  sudo add-apt-repository ppa:graphics-drivers/ppa #添加ppa源
  sudo apt update #更新apt-get
  sudo apt install nvidia-375
  #最后别忘了打开图形化界面
  sudo service lightdm start
  ```

  由于我的显卡是GTX 960M，参考了一下网友们安装的是375的显卡驱动，等我安装完成后，系统提醒我显卡驱动太低级需要升级，没有办法还是升到了390，然后重启一下，输入密码又回到了熟悉的图形化界面

#### 写在最后

当然login loop的原因不止这些，有时候`/etc/profile`中改了或者加了些东西导致这些古怪的问题，所以我们需要对症下药。正确的做法是要先去查看主目录下`.xsession-errors`日志的报错信息，从而去判断原因。

什么？你问我图形化界面进不去怎么做那么多操作？图形化进不去，还有命令行啊，我的图形化是tty1，以上操作都是在tty5中进行的。
