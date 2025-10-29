---
title: 配置 DNSPod 自动获取泛域名证书
categories: 技术相关
tags:
  - 证书
abbrlink: 4b4fd36b
date: 2024-02-05 16:57:07
---
最近升级了下家里的 LB，通过 gitlab 将 LB 的配置做了版本管理，并且通过 docker-compose 实现 LB 的快速部署。但是家里的网络做了内外网的区分，为了实现内网 https 访问，我需要在内网的 LB 上配置一套 SSL 证书（公网的部分直接在 CDN 上配置了 `let's encrypt` 的免费证书，一年一换）

为了避免麻烦，对于内网的 https 证书希望做到以下两点：
- 到期自动续
- 泛域名

<!--more-->

查找了一番，有两个工具比较符合：`Certbot` 和 `acme.sh`，都是通过 [`ACME protocol`](https://en.wikipedia.org/wiki/Automatic_Certificate_Management_Environment) 去自动获取免费证书,但是需要自动获取泛域名证书的话，还需要能够自动在 DNS Provider 处更新 [`DNS TXT Record`](https://en.wikipedia.org/wiki/TXT_record)。由于我的域名是在 DNSPod 购买的，因此需要能够支持在 DNSPod 上自动更新 TXT 记录。Certbot 没有对应的官方插件，但是有第三方好心人写的插件能够实现该功能，如 [certbot-dns-dnspod](https://github.com/tengattack/certbot-dns-dnspod)；而 acme.sh 是国人写的工具，官方支持 Aliyun 和 DNSPod，思来想去，还是打算使用 acme.sh。

### Docker Compose Configuration
根据 [官方文档](https://github.com/acmesh-official/acme.sh/wiki/deploy-to-docker-containers) 先将 Docker Compose 配置好，从文档里可以看出，acme.sh 容器会以 daemon 的形式一直运行，后续的申请证书、部署、续签等操作都需要 docker compose exec 单独去操作。Dockers Compose 配置如下：

```dockerfile
version: "3.9"
services:
  nginx:
    restart: always
    container_name: nginx
    image: nginx:latest
    ports:
      - 80:80
      - 443:443
    labels:
      - sh.acme.autoload.domain=${DOMAIN_NAME}
    volumes:
      - $PWD/conf.d:/etc/nginx/conf.d:ro
      - $PWD/nginx.conf:/etc/nginx/nginx.conf:ro
      - $PWD/log/:/var/log/nginx/:rw
    environment:
      - TZ=Asia/Shanghai
  
  acme:
    image: neilpang/acme.sh
    container_name: acme.sh
    command: daemon
    volumes:
      - $PWD/acmeout:/acme.sh
      - /var/run/docker.sock:/var/run/docker.sock
    dns:
      - 8.8.8.8
    environment:
      - DEPLOY_DOCKER_CONTAINER_LABEL=sh.acme.autoload.domain=${DOMAIN_NAME}
      - DEPLOY_DOCKER_CONTAINER_KEY_FILE=/etc/nginx/ssl/key.pem
      - DEPLOY_DOCKER_CONTAINER_CERT_FILE=/etc/nginx/ssl/cert.pem
      - DEPLOY_DOCKER_CONTAINER_CA_FILE=/etc/nginx/ssl/ca.pem
      - DEPLOY_DOCKER_CONTAINER_FULLCHAIN_FILE=/etc/nginx/ssl/full.pem
      - DEPLOY_DOCKER_CONTAINER_RELOAD_CMD="service nginx force-reload"
      - DP_Id=${DP_Id}
      - DP_Key=${DP_Key}
```
另外还需要添加一个 `.env` 文件用来存放如下变量：
- `${DOMAIN_NAME}`：用于申请证书的泛域名
- `${DP_Id}`：DNSPod API Key ID
- `${DP_Key}`：DNSPod API Key

### 申请证书
acme.sh 默认的 ssl 服务器是 `ZeroSSL.com`，根据 [文档](https://github.com/acmesh-official/acme.sh/wiki/ZeroSSL.com-CA) 里提到的，在申请证书之前，需要先注册账户
```shell
docker compose exec acme --register-account -m <your email address>
```

注册完成后就可以正式申请证书了
```shell
docker compose exec acme --issue --dns dns_dp -d ${DOMAIN_NAME}
```
等待证书申请完成后，可以看到 `acmeout` 目录下会出现一个 `${DOMAIN_NAME}` 命名的目录，该目录下就是我们申请到的证书。接着运行命令将证书部署到 nginx 的目录下（该目录则是在 docker compose 中通过 environment 传参给 acme 容器的）
```shell
docker compose exec acme --deploy -d ${DOMAIN_NAME}  --deploy-hook docker
```
理论上到这里我们的证书申请和部署就已经结束了。

### 修锅
当然我在申请证书的时候，遇到了些问题，比如在等待证书签售的过程中，一直在报错
```
Order status is processing, lets sleep and retry
```
等待的超时时间是 15s，连续 retry 了多次之后肯定是有问题的，参考了 [网络上其他的人建议](https://u.sb/acme-sh-ssl/)，将默认的 CA Server 从 `ZeroSSL.com` 更换成了 `Let's Encrypt`

```shell
docker compose exec acme --set-default-ca --server letsencrypt
```

### 续签证书
acme.sh 不用我们手动去执行 renew 的命令来续签到期的证书，正如之前所说，acme 的容器是以 daemon 状态运行的，因此他会定时的去检测我们的证书到期时间，在到期之前会自动进行 renew 操作。可以在 `acmeout/${DOMAIN_NAME}/${DOAMIN_NAME}.conf` 中看到，有一项 `Le_NextRenewTimeStr` 配置，该配置了记录了 acme.sh 下一次续签证书的时间。
