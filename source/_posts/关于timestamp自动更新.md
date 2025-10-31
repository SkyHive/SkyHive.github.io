---
title: 关于 timestamp 自动更新
categories: 技术相关
tags:
  - MySQL
abbrlink: bc87c772
date: 2017-02-09 11:10:32
---
最近笔者在“温习TP框架”（其实就是不会然后抓紧时间啃），从最简单Blog开始做起，以前学习的时候是跟着教程，用time()函数获取当前时间戳，然后用int型数据来存储。这一次我突然想用Mysql内置的时间类型的数据——timestamp。
<!--more-->

Mysql中常用到的除了timestamp之外还有datetime，我们先来比较一下这两个的区别：

1. timestamp占用的存储空间为4个字节，所以它能表示的时间范围为1970.1.1 08:00:01~2038.01.19 11:14:07，这个范围比较小，容易出现超出的情况。
2. datetime占用的存储空间为8个字节，所以它能表示的时间范围为1000.01.01 00:00:00~9999.12.31 23:59:59,这个时间范围完全够用了。

其实timestamp这个时间范围目前也是够用的，而且我也只是来学习的，所以我就选择了这个数据类型。然而后来我发现我在修改表中数据的时候时间并没有自动更新，这就比较奇怪了，我当时的sql代码是这样的：

```shell
date timestamp not null default current_timestamp;
```

后来一顿 Google 发现了问题所在，如果这个数据属性没有加上 `default current_timestamp` 的话，就会默认创建数据时获取当前时间且数据更新时更新时间，然而加上了 `default current_timestamp` 则必须要再加上 `on update current_timestamp` 才能自动更新时间。
总结如下：

* 如果该列属性 `default current_timestamp` 和 `on update` 语句都有，则初始值为当前时间并自动更新
* 如果该列属性 `default current_timestamp` 和 `on update` 语句都没有，则默认初始值为当前时间并自动更新
* 如果该列属性只有 `default current_timestamp`，那么初始值当前时间且时间不会自动更新
* 如果该列属性只有 `on update` 语句，则初始值为 0，会自动更新时间
