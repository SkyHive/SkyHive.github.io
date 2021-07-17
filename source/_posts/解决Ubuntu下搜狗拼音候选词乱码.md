---
title: 解决 Ubuntu 下搜狗拼音候选词乱码
date: 2018-05-29 13:15:26
categories: Infra
tags:
- Linux
- Ubuntu
---

今天Ubuntu系统下的搜狗拼音突然抽疯了，中文输入的时候候选词区域都是全是一串无意义的英文字母，不知道是不是因为对Linux系统的支持问题还是怎么回事，解决办法也很简单，就是删除搜狗的配置文件，重新登录就好了，只是需要重新设置原来的配置

```shell
cd ~/.config
rm -rf SogouPY* sogou*
```

别忘了注销再登录哦
