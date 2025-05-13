---
title: Hexo 搭配七牛存储图片等媒体资源
categories: Blog
tags:
  - OSS
abbrlink: 26d4b698
date: 2017-02-14 22:19:40
---
今天把博客的图片存储搞了一下，利用的七牛存储，相对来说还是比较简单，但是为了测试成功与否就只好写这篇博客了。
七牛 是一个云存储服务商，注册并实名认证之后后，你将免费享有 10GB 存储空间，每月 10GB 下载流量、100 万次 GET 请求、 10 万次 PUT/DELETE 请求。如果想要注册可以[点击这里](https://portal.qiniu.com/signup?code=3lnfyn5xmh93m)，这样可以为我增加每月5GB的容量。
<!--more-->
注册完成之后就可以进行创建空间了，注意我们添加的资源为**对象存储**，访问控制为**公开空间**

![qiniu create](https://blogpic.skyhive.tech/pic%2Fqiniu_create.png)
![qiniu set](https://blogpic.skyhive.tech/pic%2Fqiniu_set.png)

然后点击右上角进入**密钥管理**，复制当前使用的AK和SK，配置的时候会用得到
下面我们会用到一个叫做的[hexo-qiniu-sync](https://github.com/gyk001/hexo-qiniu-sync)的插件，首先在hexo主目录下安装：
```
npm install hexo-qiniu-sync - -save
```
然后把配置信息添加到_config.yml中
```
plugins:
  - hexo-qiniu-sync

#七牛云存储设置
##offline       是否离线. 离线状态将使用本地地址渲染
##sync          是否同步
##bucket        空间名称.
##access_key    上传密钥AccessKey
##secret_key    上传密钥SecretKey
##secret_file   秘钥文件路径，可以将上述两个属性配置到文件内，防止泄露，json格式。绝对路径相对路径均可
##dirPrefix     上传的资源子目录前缀.如设置，需与urlPrefix同步 
##urlPrefix     外链前缀.
##up_host      上传服务器路径,如选择华北区域的话配置为http://up-z1.qiniu.com
##local_dir     本地目录.
##update_exist  是否更新已经上传过的文件(仅文件大小不同或在上次上传后进行更新的才会重新上传)
##image/js/css  子参数folder为不同静态资源种类的目录名称，一般不需要改动
##image.extend  这是个特殊参数，用于生成缩略图或加水印等操作。具体请参考http://developer.qiniu.com/docs/v6/api/reference/fop/image/ 
##              可使用基本图片处理、高级图片处理、图片水印处理这3个接口。例如 ?imageView2/2/w/500 即生成宽度最多500px的缩略图
qiniu:
  offline: false
  sync: true
  bucket: bucket_name
  secret_file: sec/qn.json or C:
  access_key: AccessKey
  secret_key: SecretKey
  dirPrefix: static
  urlPrefix: http://bucket_name.qiniudn.com/static
  up_host: http://upload.qiniu.com
  local_dir: static
  update_exist: true
  image: 
    folder: images
    extend: 
  js:
    folder: js
  css:
    folder: css
```
其中各个参数在插件的[README文件](https://github.com/gyk001/hexo-qiniu-sync/blob/master/README.md)中都有详细的介绍，按照github上的教程一步一步来是很简单的。

然后在hexo主目录下创建本地目录（该目录要和配置中local_dir参数保持一致），然后创建iamges、js、css子目录，这样基本的配置就完成了

下面就可以在你的文章中试着插入图片了，比如你想引用在你/local_dir/images/下的图片1.png
```
{% qnimg 1.png %}
```
更高级的用法请参考github上的说明。

下面进行同步
```
hexo qiniu s    
```
