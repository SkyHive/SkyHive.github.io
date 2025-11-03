---
title: HomeLab系列-认证(上)
series: HomeLab
abbrlink: cb650389
date: 2025-10-30 14:40:20
categories: 技术相关
tags:
- lldp
- authelia
- auth
---

其实不管是在家里还是在企业里都有一个绕不过去的问题 -- 认证（~~当然如果你在家里所有的系统都只用一个账号，当就不用看这篇文章了~~）,过去的一段时间内我都是使用本地帐号游走在各个系统。由于系统职能不同，各个系统的账号也不尽相同，例如 Confluence、Gitea 这类我会创建自己的用户账号，但是 Zabbix、Grafana 这类监控系统我就会直接用默认的 Admin 账号（我承认这是习惯不好），但是如果家庭中不止一个用户呢，如果你的这些服务还需要开放到公网让更多人使用呢？

统一的用户管理在这一刻就显得很有必要，正常在企业中大多会使用 `Microsoft Active Domain` + `SSO` 作为统一管理用户的后端，但是在家里使用就显得太重了，调研了许久，最终采用 `lldap` + `authelia` 的方案。

<!--more-->

## 方案介绍

`LLDAP(Light LDAP implementation)` 是一个开源的轻量级 LDAP 服务解决方案，同时也提供了一套简单的 Web UI 用于管理，非常适合家用，具体可以前往 [Github 地址](https://github.com/lldap/lldap) 自行了解。

`Authelia` 是一个轻量级的 SSO 服务解决方案，自带一个简单的 Web Portal，同时也提供 `2FA` 认证。这是作为 `LLDAP` 补充的解决方案，毕竟不是所有系统都天然支持 `LDAP` 协议，有些仅支持 SSO 的系统就需要使用 `Authelia` 了，`Authelia`支持 `LDAP` 作为认证后端，因此 `LLDAP` 和 `Authelia` 就成了绝佳的搭配。

下面是 Deepseek 画的架构图，仅供参考 👇

```mermaid
graph TB
    %% 用户访问层
    User[用户]
    
    %% 应用系统层
    App1[支持 LDAP 的应用<br/>e.g. Confluence, Jellyfin]
    App2[仅支持 SSO 的应用<br/>e.g. Cloudreve, Immich]
    App3[其他支持 LDAP 的系统<br/>e.g. VPN, 文件服务器]
    
    %% Authelia 内部组件
    subgraph Authelia["Authelia - SSO 服务"]
        A_Portal[Web Portal<br/>登录界面]
        A_Auth[认证引擎]
        A_2FA[2FA 模块<br/>TOTP/WebAuthn]
        A_Session[会话管理]
        A_SSO[SSO 协议处理<br/>OIDC/OAuth2]
    end
    
    %% LLDAP 服务
    LLDAP[LLDAP<br/>轻量级 LDAP 服务]
    LLDAP_UI[Web UI 管理界面]
    
    %% 数据存储层
    UserDB[(用户数据库)]
    
    %% 连接关系
    User --> App1
    User --> App2
    User --> App3
    
    %% LDAP 认证流
    App1 -->|LDAP 绑定/认证| LLDAP
    App3 -->|LDAP 协议| LLDAP
    
    %% SSO 认证流
    App2 -->|重定向到 SSO| A_Portal
    A_Portal --> A_Auth
    A_Auth -->|LDAP 验证| LLDAP
    A_Auth --> A_2FA
    A_2FA --> A_Session
    A_Session --> A_SSO
    A_SSO -->|返回令牌| App2
    
    %% 管理关系
    LLDAP_UI -->|用户管理| LLDAP
    LLDAP -->|读写数据| UserDB
    
    %% 深色模式友好的样式定义
    classDef user fill:#1e3a5f,stroke:#4fc3f7,stroke-width:2px,color:#ffffff
    classDef app fill:#4527a0,stroke:#b388ff,stroke-width:2px,color:#ffffff
    classDef service fill:#1b5e20,stroke:#69f0ae,stroke-width:2px,color:#ffffff
    classDef component fill:#37474f,stroke:#ffd54f,stroke-width:1px,color:#ffffff
    classDef storage fill:#bf360c,stroke:#ffab91,stroke-width:2px,color:#ffffff
    
    class User user
    class App1,App2,App3 app
    class Authelia,LLDAP service
    class A_Portal,A_Auth,A_2FA,A_Session,A_SSO,LLDAP_UI component
    class UserDB storage
```

## 部署

### LLDAP

LLDAP 部署在容器化上做的很好，除了提供 Docker Compose 外，还有第三方提供的 K8s 的部署方式（yaml 和 helm 都有），K8s 的部署文档可参考：[LLDAP Kubernetes](https://github.com/Evantage-WS/lldap-kubernetes)

这里我们简单说下 Docker Compose 的部署，详细内容可参考 [LLDAP Installation](https://github.com/lldap/lldap/blob/main/docs/install.md#with-docker)

```yaml
version: "3"

volumes:
  lldap_data:
    driver: local

services:
  lldap:
    image: lldap/lldap:stable
    ports:
      # For LDAP, not recommended to expose, see Usage section.
      - "3890:3890"
      # For LDAPS (LDAP Over SSL), enable port if LLDAP_LDAPS_OPTIONS__ENABLED set true, look env below
      #- "6360:6360"
      # For the web front-end
      - "17170:17170"
    volumes:
      - "lldap_data:/data"
      # 或者你可以写成下面的方式，将 data 挂载到当前目录的 lldap_data
      #- "$PWD/lldap_data:/data"
    environment:
      - TZ=Asia/Shanghai
      - LLDAP_JWT_SECRET='y1,Qmy8TPc4I^7xV,rE&uNh43oyXW/e|'
      - LLDAP_KEY_SEED='[3W/lTqN.H5||gCKrFDlu|f.wpMT):e-'
      - LLDAP_LDAP_BASE_DN=dc=skyhive,dc=com
      - LLDAP_LDAP_USER_PASS=adminPas$waord
```

一些说明：

* ports
  * `3890`：默认的 ldap 端口，即不含 ssl 加密
  * `6360`：ldaps（ldap over ssl），开启需要同时设置 `env LLDAP_LDAPS_OPTIONS__ENABLED=true`
  * `1710`：web ui 端口
* env:
  * `LLDAP_JWT_SECRET`：可以使用项目根目录中 `generate_secrets.sh` 生成
  * `LLDAP_KEY_SEED`：可以使用项目根目录中 `generate_secrets.sh` 生成
  * `LLDAP_LDAP_BASE_DN`：LDAP BASE Domain，一般和你的网站域名区分开来
  * `LLDAP_LDAP_USER_PASS`：管理员密码

另外 `LLDAP` 默认将数据存储在 `sqlite` 中，如果需要使用 `MySQL` 或者 `Postgresql` 作为后端数据库，则需要配置如下 `env`：

* LLDAP_DATABASE_URL=mysql://mysql-user:password@mysql-server/my-database
* LLDAP_DATABASE_URL=postgres://postgres-user:password@postgres-server/my-database

### Authelia

相较于 `LLDAP`，`Authelia` 的部署就显得复杂了许多，和 `LLDAP` 一样，`Authelia` 也提供了 Docker Compose 和 K8s 的部署方式，具体可以参考官方文档 -- [Authelia Installation](https://www.authelia.com/integration/deployment/introduction/)

另外官方文档里说了，强烈建议在部署前先看一遍 [Get Started](https://www.authelia.com/integration/deployment/introduction/)，这里主要是一些 Bootstrap 的内容，对于各位理解部署的架构和依赖会有一些帮助

如果你是部署一套全新可用的 `Authelia` 的话，直接参考 `examples/compose/production/compose.yml` 就可以，我这里需要复用已有的 `nginx` 来代替官方 compose 中的 `traefik`，关于这部分在官方文档中亦有说明 -- [Proxy With Nginx](https://www.authelia.com/integration/proxies/nginx/)

最后我调整过的 compose 如下

```yaml
services:
  authelia:
    container_name: 'authelia'
    image: 'docker.io/authelia/authelia:latest'
    restart: 'unless-stopped'
    ports:
      - 9091:9091
    networks:
      authelia: {}
    environment:
      TZ: 'Asia/Shanghai'
    volumes:
      - '${PWD}/config:/config'
      - '${PWD}/data:/data'

  redis:
    image: 'redis:alpine'
    container_name: 'redis'
    volumes:
      - './redis:/data'
    networks:
      authelia: {}
    restart: 'unless-stopped'
    environment:
      TZ: 'Asia/Shanghai'

networks:
  authelia:
```

`config/configuration.yml` 文件内容如下：

```yaml
---
###############################################################
#                   Authelia configuration                    #
###############################################################

server:
  address: 'tcp://:9091'
  endpoints:
    authz:
      auth-request:
        implementation: 'AuthRequest'
log:
  level: 'debug'

totp:
  issuer: 'authelia.com'

identity_validation:
  reset_password:
    jwt_secret: 'AqU4EmS3IDBEDLcK*****************ZIqIHdPYiMwF1LY8OYRr'

# duo_api:
#  hostname: api-123456789.example.com
#  integration_key: ABCDEF
#  # This secret can also be set using the env variables AUTHELIA_DUO_API_SECRET_KEY_FILE
#  secret_key: 1234567890abcdefghifjkl

authentication_backend:
  #  file:
  #    path: '/config/users_database.yml'
  #
  ldap: # 上面部署的 lldap 配置
    implementation: 'lldap'
    address: 'ldap://192.168.2.12:3890' 
    base_dn: 'dc=skyhive,dc=com'
    user: 'UID=lldap,ou=people,dc=skyhive,dc=com'
    password: '\P)F*******kST'

access_control:
  default_policy: 'deny'
  rules:
    # Rules applied to everyone
    - domain: '*.skyhive.tech'
      policy: 'bypass'

session:
  # This secret can also be set using the env variables AUTHELIA_SESSION_SECRET_FILE
  secret: 'XJQds3WCadzsNHY8Cq*****************GJ2m6nu9HbyX07Z2crqbRO3rXK'

  cookies:
    - name: 'authelia_session'
      domain: 'skyhive.tech'  # Should match whatever your root protected domain is
      authelia_url: 'https://auth.skyhive.tech'   # authelia sso 地址
      default_redirection_url: 'https://confluence.skyhive.tech' # 这里是当你直接登录 auth.skyhive.tech 后跳转的网站页面
      expiration: '1 hour'
      inactivity: '5 minutes'

  redis:
    host: 'redis'
    port: 6379
    # This secret can also be set using the env variables AUTHELIA_SESSION_REDIS_PASSWORD_FILE
    # password: authelia

regulation:
  max_retries: 3
  find_time: '2 minutes'
  ban_time: '5 minutes'

storage:
  encryption_key: 'd4yohU2v2fzwIoObdGY1****************L5wbgMT227XvmJad1z'
  local:
    path: '/data/db.sqlite3'

notifier:
  filesystem:
    filename: '/config/notification.txt'
```

如果你没有对接认证后端的话，可以使用本地账户，用 `config/users_database.yml` 来进行声明用户配置（同时要在上述 `configuration.yml` 中配置 authentication_backend 为 file，详见：[First Factor](https://www.authelia.com/configuration/first-factor/file/)），users 的配置参考如下：

```yaml
users:
  authelia:
    disabled: false
    displayname: 'Authelia User'
    # Password is authelia
    password: '$6$rounds=50000$BpLnfgDsc2WD8F2q$Zis.ixdg9s/UOJYrs56b5QEZFiZECu0qZVNsIYxBaNJ7ucIL.nlxVCT5tqh8KHG8X4tlwCFm5r6NTOZZ5qRFN/
    email: 'authelia@authelia.com'
    groups:
      - 'admins'
      - 'dev'
```

最后就是 `nginx` 的配置

```nginx
server {
  listen         443 ssl http2;
  server_name    auth.skyhive.tech;
  access_log  /var/log/nginx/auth.skyhive.tech_access.log;
  error_log   /var/log/nginx/auth.skyhive.tech_error.log;
  ssl_certificate /etc/nginx/ssl/full.pem;
  ssl_certificate_key /etc/nginx/ssl/key.pem;
  ssl_protocols        TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers          ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
  ssl_prefer_server_ciphers  on;
  ssl_session_cache    shared:SSL:10m;
  ssl_session_timeout  10m;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  set $upstream http://192.168.2.12:9091;

  location / {
      include /etc/nginx/snippets/proxy.conf;
      proxy_pass $upstream;
  }

#  location = /api/verify {
#      proxy_pass $upstream;
#  }
#
#  location /api/authz/ {
#      proxy_pass $upstream;
#  }

}

server {
  listen         80;
  server_name    auth.skyhive.tech;
  return 301 https://$host$request_uri;
}
```

此处 `server_name` 就是前面在 `configuration.yaml` 中配置的 `authelia_url` 的域名。至此整个初始化的流程就全部走完了，后续就是应用去对接 `LDAP` 或者 `OIDC` 了 ~
