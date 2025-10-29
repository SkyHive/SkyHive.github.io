---
title: Hadoop 简介
categories: 技术相关
tags:
  - Hadoop
abbrlink: 8164914c
date: 2017-11-17 20:56:31
---
### Hadoop 介绍	

Hadoop 是 Apache 组织的一个分布式计算框架（java语言），其最核心的设计就是：**HDFS** 和**MapReduce**，HDFS实现存储，MapReduce实现原理分析处理。

#### HDFS文件系统

**HDFS**（Hadoop Distributed File System）是一个高度容错的系统，适合部署在廉价的机器上。HDFS能提供高吞吐量的数据访问，适合那些有着超大数据集的应用程序。
<!--more-->
##### 设计特点

* 大数据文件，适合大文件或者一堆大数据文件
* 文件分块存储，HDFS会将一个完整的大文件平均分块存储到不同计算机上
* 流式数据访问，一次写入多次读写，和传统文件不同，它不支持动态改变文件内容，而是要求让文件一次写入就不做变化，要变化只能在文件末尾添加
* 廉价硬件
* 备份，为防止某个主机失效读取不到该主机的块文件，它将同一个文件块副本分配到其他某几个主机上

##### Master / Slave架构

一个HDFS集群是有一个Namenode和一定数目的Datanode组成。Namenode作为中心服务器负责管理文件系统的namespace和客户端对文件的访问，Datanode在集群中负责管理结点上他们附带的存储。在内部，一个文件其实分成一个或多个block，这些block存储在Datanode集合里。Namenode执行文件系统的namespace操作，如打开、关闭、重命名等，同时决定 block到具体Datanode结点的映射。Datanode在Namenode的指挥下进行block的创建、删除和复制。

##### HDFS的一些关键元素

* Block：将文件分块，通常为64M。
* NameNode：保存整个文件系统的目录信息、文件信息及分块信息，由唯一一台主机专门保存。（2.0版本后增加备份）
* DataNode：用于存储Block文件。
* NameNode全权管理数据块的复制，它周期性地从集群中的每个DataNode接受心跳信号和块状态报告（BlockReport）。结合艘到心跳信号以为这该DataNode工作正常，块状态报告包含了一个该DataNode上所有数据块的列表。



#### MapReduce文件系统

MapReduce是一种编程模型，用于大规模数据的并行运算。MapReduce分成两个部分：**Map**（映射）和**Reduce**（归纳）。当你向MapReduce框架提交一个计算作业时，它会首先把计算作业拆分成若干个Map任务，然后分配到不同的节点上去执行，每一个Map任务处理输入数据中的一部分，当Map任务完成后，它会生成一些中间文件，这些中间文件将会作为Reduce任务的输入数据。Reduce任务的主要目标就是把前面若干个Map的输出汇总并输出。
