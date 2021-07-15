---
title: 搭建属于自己的 Shadowsocks 服务
date: 2017-08-11 12:52:41
categories: Other
tags:
---
最近一直想自己搭一个 Shadowsocks 服务，并且利用服务器学习一些技术知识，但是国内的服务器实在是贵得很啊，像我这种苦逼大学生根本玩不起，无奈之下只好各种 Google 百度，最后找到了一些国外的 VPS 资源

* BandwagonHost([搬瓦工VPS](http://banwagong.cn/fangan.html))：据观察搬瓦工这个 VPS 还是算计比较便宜的，年付 $20 ，平均下来每个月只有 $1.6，而且套餐很良心很良心,512MB 的内存，10GB 的 SSD，1TB 的流量是不是比国内很多主机都划算的很。
![DO1](http://blogpic.skyhive.tech/images/DO1.png)  
<!--more-->
* [Vultr](https://www.vultr.com/):同样也是 SSD VPS,这个套餐看起来也还是很不错的，只不过每月两刀的套餐总是能被抢空。

![DO2](http://blogpic.skyhive.tech/images/DO2.png)

* Digital Ocean：也是我目前正在使用的，大家可以[点击此链接注册](https://m.do.co/c/0b7931b5f2e8)，通过这个优惠链接注册的小伙伴们会直接获得 $10 的额度在你的账户余额里。而且他的这个套餐也是很诱人的，同样的 SSD VPS，20G 硬盘，每月 1TB 流量，1G 的带宽，只不过这个费用看起来太贵了，一个月需要 $5。
![DO3](http://blogpic.skyhive.tech/images/DO3.png)
  但是事情有这么简单吗？

当然没有，鼎鼎大名的 gayhub 上有个提供给[学生的pack](https://education.github.com)，里面有各种东西，有需要者可以根据需要去使用，其中就有 Digital Ocean 的价值 $50 的 credit。好了，既然有了这等美差，下面该怎么搞呢？

既然是给学生用的，那么 github 肯定要判断你学生的身份，这个时候你需要一个edu邮箱，基本上国内很多大学都会给学生使用 edu 邮箱的，用你的 edu 邮箱去注册 github；或者有的已经注册过 github 的怎么办呢，登录帐号后进入 setting 选项，在右侧的 Email 中添加一个 Email 地址，然后验证就好了。进入[学生包申请页面](https://education.github.com)，点击`GET your pack`，然后就正常填写信息即可，之后我们就能获得需要的优惠码了。
![DO4](http://blogpic.skyhive.tech/images/DO4.png)
下面我[注册Digital Ocean](https://m.do.co/c/0b7931b5f2e8)，正常的注册步骤，邮箱注册可以使用任意邮箱；邮箱验证结束之后进入到第二部验证，这一步需要有`信用卡`或者`PayPal`之类的(如果你我皆是大穷逼的话，可以和我一样选择使用`PayPal`，[注册](https://www.paypal.com)一个PayPal再去绑定一张卡即可),选择`PayPal`验证，然后支付 $5 即可完成验证，第三步是创建一个 Droplet，即创建一个 VPS，至于配置：
* 系统根据你的需要去选择

* size 选最小的 $5/mo 即可，你要是有钱我也不说什么了

* 数据中心的话，推荐洛杉矶1号机房吧，至于他们说的什么新加坡，我亲测慢成狗。

之前注册的时候花了 $5，送了 $10，加上优惠码的 $50，一共就有 $65 了，实际花费 $5，使用十三个月，是不是物超所值。

VPS创建完之后，Digital Ocean会把 IP、账号和密码都发到你的注册邮箱，然后你就可以 ssh 登录到服务器啦！

-----------------------------------------
下面就开始搭建我们的`Shadowsocks`服务：
#### 安装Shadowsocks
首先我们要安装`Shadowsocks`，由于`Shadowsocks`是用`python`写的，我们先安装`pip`
```
#由于我用的是Ubuntu的系统，其他系统的用户请自行Google
apt-get install python-pip
pip install shadowsocks
```
#### 优化Shadowsocks性能
按照SS官方Wiki，我们进行优化：

创建`local.conf`配置文件
```
vim /etc/sysctl.d/local.conf
```
进入编辑模式之后输入以下内容：
```
# max open files
fs.file-max = 51200
# max read buffer
net.core.rmem_max = 67108864
# max write buffer
net.core.wmem_max = 67108864
# default read buffer
net.core.rmem_default = 65536
# default write buffer
net.core.wmem_default = 65536
# max processor input queue
net.core.netdev_max_backlog = 4096
# max backlog
net.core.somaxconn = 4096

# resist SYN flood attacks
net.ipv4.tcp_syncookies = 1
# reuse timewait sockets when safe
net.ipv4.tcp_tw_reuse = 1
# turn off fast timewait sockets recycling
net.ipv4.tcp_tw_recycle = 0
# short FIN timeout
net.ipv4.tcp_fin_timeout = 30
# short keepalive time
net.ipv4.tcp_keepalive_time = 1200
# outbound port range
net.ipv4.ip_local_port_range = 10000 65000
# max SYN backlog
net.ipv4.tcp_max_syn_backlog = 4096
# max timewait sockets held by system simultaneously
net.ipv4.tcp_max_tw_buckets = 5000
# turn on TCP Fast Open on both client and server side
net.ipv4.tcp_fastopen = 3
# TCP receive buffer
net.ipv4.tcp_rmem = 4096 87380 67108864
# TCP write buffer
net.ipv4.tcp_wmem = 4096 65536 67108864
# turn on path MTU discovery
net.ipv4.tcp_mtu_probing = 1

# for high-latency network
net.ipv4.tcp_congestion_control = hybla

# for low-latency network, use cubic instead
# net.ipv4.tcp_congestion_control = cubic
```
保存退出后，执行以下命令使之生效：
```
sysctl --system
```

#### 配置Shadowsocks配置文件
在`/etc/`下创建配置文件：`vim /etc/shadowsocks.json`
然后进行编辑：
```
{
    "server":"my_server_ip",
    "server_port":8388,
    "local_address":"127.0.0.1",
    "local_port":1080,
    "password":"mypassword",
    "timeout":300,
    "method":"aes-256-cfb"        #这里的加密方式也可以选择其他的类型，自行把握
    "fast_open":false
}
```
#### 最后启用Shadowsocks服务端功能
```
nohup ssserver -c /etc/shadowsocks.json -d start &
```
>`nohup`是把运行日志输出到当前用户主目录下的`nohup.out`文件中

到这里 VPS 上的 Shadowsocks 服务基本上就搭建完毕了，接下来的事情我想大家应该都会做了吧，爬上梯子开始翻墙吧。

