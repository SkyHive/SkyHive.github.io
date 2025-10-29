---
title: Galera 集群搭建
categories: 技术相关
tags: MySQL
abbrlink: bb5c39fc
date: 2021-08-16 16:22:19
---
### Galera 简介
Galera Cluster 是基于 MySQL/Innodb 二次开发而成的一个支持“多主同步”的数据库主从集群。具备多主、同步复制、高可用等特点。

MariaDB Galera Cluster，由 MariaDB 和 MySQL-wsrep 补丁实现,同 Percona 的 PXC 数据库集群,目前只支持运行在 Linux 系统上。从 MariaDB 10.1 版开始，MariaDB Server 和 MariaDB Galera Server 安装包已经合并，安装 MariaDB 时，Galera 相关依赖安装包会自动安装，像内置的插件或存储引擎一样，通过简单配置即可启用。

### Galera 集群状态
查看集群状态
```sql
SHOW STATUS LIKE 'wsrep_local_state_comment';
```
<!--more-->

状态|说明
:-:|:---------:
Open | 节点启动成功，尝试连接到集群；如果失败则根据配置退出或者创建新集群
Primary | 节点已处于集群中，在新节点加入时，选取 donor 进行数据同步时会产生的状态
Joiner | 节点处于等待接收/接收同步文件的状态
Joined | 节点完成数据同步，但有部分数据没跟上，在尝试保持和集群进度一致的过程状态。<br>例如某个节点故障后，重新加入集群，在追赶集群进度时的状态
Synced | 节点正常提供服务的状态，表示已经同步完成并和集群进度保持一致
Donor | 节点处于为新节点提供全量数据同步时的状态。此时该节点对客户端不提供服务

### 基本概念
1. Primary Component：在网络发生故障时，由于网络连接原因，集群可能被分成好几个小集群，但只能有一个集群可以继续进行数据修改，集群的这部分称为 Primary Component
2. GTID：Global Transaction ID，由 UUID 和 sequence number 偏移量组成。wsrep api 中定义的集群内部全局事务 id，一个顺序 ID，用于记录集群中发生状态改变的唯一标识以及队列中的偏移量
3. SST：State Snapshot Transfer（状态快照迁移），集群中数据共享节点通过从一个节点到另外一个节点迁移完整的数据拷贝（全量拷贝）。当一个新的节点加入到集群中，新的节点从集群中已有节点同步数据，开始进行状态快照迁移，可以在 Galera 集群中选择两种不同的状态转移方法
    
    3.1 逻辑数据转移：采用 mysqldump 命令，在转移之前，需要数据接收方服务器完全启动，并准备好接受数据的连接准备。这是一个阻塞式方法，数据共享节点 Donor 在状态转移节点处于只读状态，在数据共享节点 Donor 上适用 FLUSH TABLES WITH READ LOCK 命令，mysqldump 是速度最慢的 SST 方法，在负载比较的数据库集群上可能是个问题。
    
    3.2 物理数据转移：该方法采用 rsync、rsync_wan、xtrabackup 或其他方法从服务器之间直接拷贝数据，数据接受服务器在拷贝完数据后启动服务器。该方法较 mysqldump 速度较快，但存在一定的限制，只能在服务器启动时采用，数据接受服务器需要同数据共享服务器 Donor 配置相同（例如，服务器间 innodb_file_per_table 配置必须完全一致）。
4. IST：Incremental State Transfer（增量状态迁移），集群一个节点通过识别新加入节点缺失的事务操作，将该操作发送，而并不像SST那样的全量数据拷贝。该方法只在特定条件下可用：
    
    4.1 新加入节点的状态 UUID 与集群组中节点一致；
    
    4.2 新加入节点所缺失的写数据集 write-sets 可以在 Donor 的写数据集 write-sets 存在。

### 搭建过程
#### 环境信息
hostname|IP
:-:|:-:
db01 | 192.168.2.10
db02 | 192.168.2.11
db03 | 192.168.2.12

```bash
## 安装依赖
sudo apt update
sudo apt install -y mariadb-server-10.3
 
## 配置集群
### 在第一台主机操作
systemctl stop mysql
vim /etc/mysql/mariadb.conf.d/50-server.cnf
# 在 [mysqld] 下添加 skip-name-resolve
# 在文件末尾添加如下内容
[galera]
wsrep_on=ON
wsrep_provider=/usr/lib/galera/libgalera_smm.so
wsrep_cluster_address="gcomm://"
binlog_format=row
default_storage_engine=InnoDB
innodb_autoinc_lock_mode=2
bind-address=0.0.0.0
# any cluster name
wsrep_cluster_name="MariaDB_Cluster"
# own IP address
wsrep_node_address="192.168.2.10"
 
### 完成后保存退出
galera_new_cluster
 
mysql -uroot -p
  
CREATE USER 'root'@'%' IDENTIFIED BY 'Iamadm1n!!';
GRANT ALL ON *.* TO 'root'@'%';
update mysql.user set  Grant_priv='Y' where user='root' and host='%';
flush privileges;
exit


### 在其他两台主机操作
systemctl stop mysql
vim /etc/mysql/mariadb.conf.d/50-server.cnf
# 在 [mysqld] 下添加 skip-name-resolve
# 在文件末尾添加如下内容
[galera]
wsrep_on=ON
wsrep_provider=/usr/lib/galera/libgalera_smm.so
wsrep_cluster_address="gcomm://192.168.2.10,192.168.2.11,192.168.2.12"
binlog_format=row
default_storage_engine=InnoDB
innodb_autoinc_lock_mode=2
bind-address=0.0.0.0
# any cluster name
wsrep_cluster_name="MariaDB_Cluster"
# own IP address
wsrep_node_address="192.168.2.11"   ## 注意：这里填写当前节点的 IP，另外一个节点填 192.168.2.12
 
### 完成后保存退出
## 重启 MySQL 服务
systemctl start mysql
systemctl enable mysql
 
## 检查集群状态
mysql -uroot -p
show status like 'wsrep_cluster%';
## 需观察 'wsrep_cluster_size' 是否正常（正常为节点数量），以及 'wsrep_cluster_status' 是否为 Primary
 
## 如果集群状态正常，则去修改第一个节点的 /etc/mysql/mariadb.conf.d/50-server.cnf 文件
## 将 wsrep_cluster_address 配置修改和其他两个节点一致即可
```
