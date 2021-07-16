---
title: DNS 缓存清理
date: 2020-04-01 12:34:22
categories: Infra
tags:
- DNS
---
## Windows 下清理
```
# 管理员身份运行 cmd
 
ipconfig /flushdns
```
<!--more-->
## Linux 下清理
Linux DNS 缓存和 Windows 有些许不同，大部分的 Linux 是没有系统级缓存的，所以通过一些进程便可以达到清理 DNS 缓存的目的以下一份来自 StackOverflow 的解答：
> On Linux (and probably most Unix), there is no OS-level DNS caching unless nscd is installed and running. Even then, the DNS caching feature of nscd is disabled by default at least in Debian because it’s broken. The practical upshot is that your linux system very very probably does not do any OS-level DNS caching.
You can look around in the resolv subdirectory of the glibc source code, it’s all there. That’s not a specific answer, I realize, but it comes down to the fact that there’s no code in there that implements a cache and in any case you can see if you trace it that it makes no use of any file or shared memory segment or other kind of location where this cache could potentially be stored.

Linux 下的 DNS 守护进程大多为 nscd、dnsmasq、systemd-resolved 等
```
## nscd 三种操作均可
sudo /etc/init.d/nscd restart
sudo systemctl restart nscd
sudo systemctl reload nscd
 
 
## dnsmasq 两种操作均可
sudo /etc/init.d/dnsmasq restart
sudo systemctl restart dnsmasq
 
 
## systemd-resolved
sudo systemd-resolve --flush-caches
 
 
## 除此之外，还可以使用 dns-clean 来进行清理
sudo /etc/init.d/dns-clean start
```

## 浏览器 DNS 缓存清理
* chrome
1. 地址栏输入 chrome://net-internals/#dns
2. 点击 “清除主机缓存/Clear Host Cache”
3. 如果上述步骤不行的话，按下 CTRL+Shift+Del 打开“清除浏览数据”对话框
4. 选择时间范围（选择“所有时间”）
5. 选中 “Cookie 和其他站点数据” 和 “缓存的图像和文件”
6. 点击 “清除数据”
* FireFox
1. 点击右上角 Firefox 菜单
2. 点击 Options（Preference）
3. 点击左侧 “隐私和安全性” 或 “隐私” 选项卡
4. 滚动到 History 部分，点击 “Clear History”
5. 选择所有框，点击 “立即清除”
6. 如果上述步骤不管用，在地址栏中输入 about:config
7. 搜索 network.dnsCacheExpiration，将值暂时设置为 0，然后点击 “确定” 后在恢复默认值，点击 “确定”
8. 搜索 network.dnsCacheEntries，将值暂时设置为 0，然后点击 “确定” 后在恢复默认值，点击 “确定”
