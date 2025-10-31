---
title: 解决Ubuntu系统设置打不开
categories: 技术相关
tags:
  - linux
  - Ubuntu
abbrlink: 4b016079
date: 2017-02-14 19:23:32
---
今天把 `Ubuntu从16.04` 更新到 `16.10` 之后卸载了些软件，之后蛋疼的发现系统设置打不开了，真是欲哭无泪。去网上搜了下发现是我之前由于卸载了 `iBus` 导致的，虽然我不懂为什么 `iBus` 和 `Ubuntu` 之间的关系为什么会如此紧密，但是既然发生了这种事情我也很绝望啊，只能按照网上的方法

```shell
sudo apt-get install ubuntu-desktop         #这个会把Ubuntu预装的软件office还有Amazon什么的装回来，装完自己再慢慢卸载吧
```

或者他也提供了一次性的安装办法

```shell
sudo apt-get install ibus-pinyin unity-control-center unity-control-center-signon webaccounts-extension-common xul-ext-webaccounts
```

但是我眉头一皱，发现事情并不简单，我继续搜了下去，也有很多人遇到这种问题，发现还有更简单的办法

```shell
sudo apt-get install gnome-control-center           #如果系统设置打不开，请重新安装gnome-control-center
sudo apt-get install unity-control-center           #如果设置里只有很少的几个图标请重新安装unity-control-center
```

当然上面两个方法并没有尝试过，我也无从得知导致我系统设置打不开的原因是不是卸载了 `iBus`
