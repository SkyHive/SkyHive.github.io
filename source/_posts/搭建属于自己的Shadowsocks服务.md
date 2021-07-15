---
title: 搭建属于自己的Shadowsocks服务
date: 2017-08-11 12:52:41
categories: Other
tags:
---
最近一直想自己搭一个Shadowsocks服务，并且利用服务器学习一些技术知识，但是国内的服务器实在是贵得很啊，像我这种苦逼大学生根本玩不起，无奈之下只好各种google百度，最后找到了一些国外的VPS资源

* BandwagonHost([搬瓦工VPS](http://banwagong.cn/fangan.html))：据观察搬瓦工这个VPS还是算计比较便宜的，年付20刀，平均下来每个月只有1.6刀，而且套餐很良心很良心,512MB的内存，10GB的SSD，1TB的流量是不是比国内很多主机都划算的很。
  <!--more-->
* [Vultr](https://www.vultr.com/):同样也是SSD VPS,这个套餐看起来也还是很不错的，只不过每月两刀的套餐总是能被抢空。

![DO2](/home/skyhive/hexo/picture/images/DO2.png)

* Digital Ocean：也是我目前正在使用的，大家可以[点击此链接注册](https://m.do.co/c/0b7931b5f2e8)，通过这个优惠链接注册的小伙伴们会直接获得10美刀的额度在你的账户余额里。而且他的这个套餐也是很诱人的，同样的SSD VPS，20G硬盘，每月1TB流量，1G的带宽，只不过这个费用看起来太贵了，一个月需要五美刀。
  {% qnimg DO3.png %}
  但是事情有这么简单吗？

当然没有，鼎鼎大名的gayhub上有个提供给[学生的pack](https://education.github.com)，里面有各种东西，有需要者可以根据需要去使用，其中就有Digital Ocean的价值50刀的credit。好了，既然有了这等美差，下面该怎么搞呢？

既然是给学生用的，那么github肯定要判断你学生的身份，这个时候你需要一个edu邮箱，基本上国内很多大学都会给学生使用edu邮箱的，用你的edu邮箱去注册github；或者有的已经注册过github的怎么办呢，登录帐号后进入setting选项，在右侧的Email中添加一个email地址，然后验证就好了。进入[学生包申请页面](https://education.github.com)，点击`GET your pack`，然后就正常填写信息即可，之后我们就能获得需要的优惠码了。
{% qnimg DO4.png %}
下面我[注册Digital Ocean](https://m.do.co/c/0b7931b5f2e8)，正常的注册步骤，邮箱注册可以使用任意邮箱；邮箱验证结束之后进入到第二部验证，这一步需要有`信用卡`或者`PayPal`之类的(如果你我皆是大穷逼的话，可以和我一样选择使用`PayPal`，[注册](https://www.paypal.com)一个PayPal再去绑定一张卡即可),选择`PayPal`验证，然后支付5美刀即可完成验证，第三步是创建一个Droplet，即创建一个VPS，至于配置：
* 系统根据你的需要去选择

* size选最小的$5/mo即可，你要是有钱我也不说什么了

* 数据中心的话，推荐洛杉矶1号机房吧，至于他们说的什么新加坡，我亲测慢成狗。

之前注册的时候花了5美元，送了10美元，加上优惠码的50美元，一共就有65美元了，实际花费五美元，使用十三个月，是不是物超所值。

VPS创建完之后，Digital Ocean会把IP、账号和密码都发到你的注册邮箱，然后你就可以利用putty或者ssh登录到服务器啦！

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

到这里VPS上的Shadowsocks服务基本上就搭建完毕了，接下来的事情我想大家应该都会做了吧，爬上梯子开始翻墙吧。

