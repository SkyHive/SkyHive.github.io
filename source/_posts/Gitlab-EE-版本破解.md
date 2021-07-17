---
title: Gitlab EE 版本破解
date: 2020-05-24 23:24:01
categories: Infra
tags:
- GitLab
---
### 环境信息
* Ubuntu 16.04
* Ruby 环境（Version ≥2.5）

### 破解过程
#### 安装依赖
```bash
## 确认 ruby 版本最低为 2.5，否则需要升级
sudo apt-add-repository ppa:brightbox/ruby-ng
sudo apt update
sudo apt install ruby2.5 ruby2.5-dev
 
## 安装 gitlab ruby 环境依赖
sudo gem install gitlab
sudo gem install gitlab-license
sudo gem install openssl
```
<!--more-->
#### 签名
创建 license.rb 文件，并写入一下内容

```bash
require 'openssl'
require 'gitlab/license'
  
# Generate a key pair. You should do this only once.
key_pair = OpenSSL::PKey::RSA.generate(2048)
  
# Write it to a file to use in the license generation application.
File.open("license_key", "w") { |f| f.write(key_pair.to_pem) }
  
# Extract the public key.
public_key = key_pair.public_key
# Write it to a file to ship along with the main application.
File.open("license_key.pub", "w") { |f| f.write(public_key.to_pem) }
  
# In the license generation application, load the private key from a file.
private_key = OpenSSL::PKey::RSA.new File.read("license_key")
Gitlab::License.encryption_key = private_key
  
# Build a new license.
license = Gitlab::License.new
  
# License information to be rendered as a table in the admin panel.
# E.g.: "This instance of GitLab Enterprise Edition is licensed to:"
# Specific keys don't matter, but there needs to be at least one.

# 这里的用户信息大家可以自行填写
license.licensee = {
  "Name"    => "SkyHive",
  "Company" => "SkyHive",
  "Email"   => "skyhive@163.com"
}
  
# The date the license starts.
# Required.
license.starts_at         = Date.new(2021, 4, 25) # license 开始生效时间
# The date the license expires.
# Not required, to allow lifetime licenses.
license.expires_at        = Date.new(2049, 4, 25) # license 到期时间
  
# The below dates are hardcoded in the license so that you can play with the
# period after which there are "repercussions" to license expiration.
  
# The date admins will be notified about the license's pending expiration.
# Not required.
license.notify_admins_at  = Date.new(2099, 4, 25) # license 管理员过期提醒时间
  
# The date regular users will be notified about the license's pending expiration.
# Not required.
license.notify_users_at   = Date.new(2099, 4, 25) # license 普通用户过期提醒时间
  
# The date "changes" like code pushes, issue or merge request creation
# or modification and project creation will be blocked.
# Not required.
license.block_changes_at  = Date.new(2049, 5, 7)
  
# Restrictions bundled with this license.
# Not required, to allow unlimited-user licenses for things like educational organizations.
license.restrictions  = {
  # The maximum allowed number of active users.
  # Not required.
  active_user_count: 10000  # license 人数配额
  
  # We don't currently have any other restrictions, but we might in the future.
}
  
puts "License:"
puts license
  
# Export the license, which encrypts and encodes it.
data = license.export
  
puts "Exported license:"
puts data
  
# Write the license to a file to send to a customer.
File.open("GitLabBV.gitlab-license", "w") { |f| f.write(data) }
  
  
# In the customer's application, load the public key from a file.
public_key = OpenSSL::PKey::RSA.new File.read("license_key.pub")
Gitlab::License.encryption_key = public_key
  
# Read the license from a file.
data = File.read("GitLabBV.gitlab-license")  # 生成license存储文件名
  
# Import the license, which decodes and decrypts it.
$license = Gitlab::License.import(data)
  
puts "Imported license:"
puts $license
  
# Quit if the license is invalid
unless $license
  raise "The license is invalid."
end
  
# Quit if the active user count exceeds the allowed amount:
if $license.restricted?(:active_user_count)
  active_user_count = 1000
  if active_user_count > $license.restrictions[:active_user_count]
    raise "The active user count exceeds the allowed amount!"
  end
end
  
# Show admins a message if the license is about to expire.
if $license.notify_admins?
  puts "The license is due to expire on #{$license.expires_at}."
end
  
# Show users a message if the license is about to expire.
if $license.notify_users?
  puts "The license is due to expire on #{$license.expires_at}."
end
  
# Block pushes when the license expired two weeks ago.
module Gitlab
  class GitAccess
    # ...
    def check(cmd, changes = nil)
      if $license.block_changes?
        return build_status_object(false, "License expired")
      end
  
      # Do other Git access verification
      # ...
    end
    # ...
  end
end
  
# Show information about the license in the admin panel.
puts "This instance of GitLab Enterprise Edition is licensed to:"
$license.licensee.each do |key, value|
  puts "#{key}: #{value}"
end
  
if $license.expired?
  puts "The license expired on #{$license.expires_at}"
elsif $license.will_expire?
  puts "The license will expire on #{$license.expires_at}"
else
  puts "The license will never expire."
end
```

```bash
## 执行 license.rb 脚本
ruby license.rb
  
## 执行脚本后目录当前会生成三个文件
# GitLabBV.gitlab-license 为 GitLab License 文件
# license_key.pub 为自签名的公钥
# licens_key 为自签名的私钥
```
#### 更换证书，添加 license
```bash
## 替换证书
# 将上一步生成的公钥文件 license_key.pub 替换 GitLab 服务器中的 /opt/gitlab/embedded/service/gitlab-rails/.license_encryption_key.pub 文件
gitlab-ctl restart  # 重启 GitLab
 
## 删除数据库中原 license 记录
su - gitlab-psql
psql -h /var/opt/gitlab/postgresql -d gitlabhq_production
delete from licenses where id = 1;   # 如果有多条记录就都删掉
 
## 添加 license
# 将上一步生成的 GitLabBV.gitlab-license 导入 GitLab 即可
```
#### 修改 GitLab 等级
```bash
## 默认的 EE 版等级肯定不能满足我们，这一波直接拉满
vim /opt/gitlab/embedded/service/gitlab-rails/ee/app/models/license.rb
--------
restricted_attr(:plan).presence || ULTIMATE_PLAN   #修改
--------
gitlab-ctl restart      # 重启 GitLab
```
