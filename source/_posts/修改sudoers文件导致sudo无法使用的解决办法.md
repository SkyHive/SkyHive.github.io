---
title: 修改sudoers文件导致sudo无法使用的解决办法
date: 2018-08-08 22:09:41
categories: Infra
tags:
- Linux
---

之前因为修改过`/etc/sudoers`文件，有个地方语法错误，导致修改完成之后`sudo`命令无法使用

网上搜过很多解决办法，大都是重启进入单用户模式，以Root用户的身份修改`sudoers`文件，解决原本的语法错误。但是这个方法的硬条件是需要重启进入单用户模式，但是有的时候我们是以`ssh`的方式登录到LInux机器上去的，所以相应的也会有不需要重启的操作就能解决这种问题，当然这种操作也有一个硬条件——Linux上已经安装了`Pkttyagent`和`pkexec`，我并不知道这两个软件是不是所有Llinux系统都预装，所以大家都自己拿捏一下。

那么进入正题

首先，我们需要开两个session连接到Linux机器上

第一步：在以第一个session上输入

```shell
echo $$
```

得到你目前Bash的PID。

第二步：在第二个session上输入

```shell
pkttyagent --process pid #这里的pid是上一步获取到的，直接复制过来就好了
```

第三步：回到第一个session中，输入

```shell
pkexec visudo
```

第四步：回到第二个session，你会发现Bash提示你进行权限认证，输入密码后，再回到第一个session

第五步：回到第一个session后就是我们熟悉的visudo界面啦，下面的操作大家心里都有数了



**总结一下，没事不要乱改和sudo有关的任何东西，会出事，绝逼会出事**