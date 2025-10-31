---
title: nginx 端口转发被强行更改
categories: 技术相关
series: HomeLab
tags:
  - nginx
  - homelab
abbrlink: '58e40093'
date: 2024-02-09 17:50:16
---
[上一篇文章](https://blog.skyhive.tech/post/4b4fd36b.html)说到在家里把 LB 升了级并且通过 `acme.sh` 自动配置了 LB 的泛域名证书，可以看到基本的结构如下：

{% plantuml %}
  actor User

  User --> (Router): <Internet Port 8443>
  Router --> (LB): <Map Port 443>
  LB --> (Conflunce)
  LB --> (Gitlab)
  LB --> (Zabbix)
  LB --> (Grafana)
  LB --> (Jellyfin)
{% endplantuml %}

由于这些服务都是运行在家里的服务器中，最终 LB 的 443 端口我是在路由器上通过端口映射的方式转到 8443 端口上的（家庭宽带的公网 IP 会将 80/443 等常用端口封禁）。而我为了优雅（确实不想在公网通过域名加端口的形式访问某个网站或者服务），在公网使用 CDN 来把我对公网映射的 8443 端口转换成了 443。这个做法对于正常的 Web 服务来说没有任何问题，但是对于网盘服务来说就有些伤筋动骨，毕竟网盘服务流量比较大，使用 CDN 的话确实比较费钱。因此对于网盘服务我又单独映射了一个 8888 端口到公网，在金钱面前，我不再选择优雅。
<!--more-->

那么对于网盘服务来说，正常的访问路径就是：

{% plantuml %}

actor User

User --> (Router): <Internet Port 8888>
Router --> (LB): <Map Port 443>
LB --> (Nextcloud): <Proxy Port 8080>

{% endplantuml %}

乍一看好像挺正常的，但是在我通过公网去访问的是时候

```shell
curl https://<domain_name>:8888
```

出现的结果往往是，nginx 直接把我的 8888 端口给重定向成了 8080，也就是变成了 `https://<domain_name>:8080` 的访问。后来查了一下，是需要在 nginx location 的配置中稍微做些修饰，随即将该方法记录下来

```nginx

server {

  listen 443 ssl;
  ……
  port_in_redirect off;  ## 需要在 server 中加上这个配置防止 port redirect

  location / {
    proxy_pass http://192.168.2.150:8080;
    proxy_set_header Host $host:$server_port;    ## Host header 需要有 $host:$server_port，即 host 和 port 都得有，否则 port 就会变成 proxy_pass 中的 port
    ……
  }
}

```

以上基本上可以解决问题，如若不能，则还得继续 Google 一番。
