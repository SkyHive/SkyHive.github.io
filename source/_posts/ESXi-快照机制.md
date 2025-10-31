---
title: ESXi 快照机制
categories: 技术相关
tags:
  - 虚拟化
  - ESXi
abbrlink: 35b185c
date: 2020-06-17 23:47:50
---
> [Understanding VM Sanpshots in ESXi](https://kb.vmware.com/s/article/1015180)</br>
[VMware vSphere 6.7 虚拟机快照原理及 Veeam Backup 备份](https://kknews.cc/code/y5pnlkj.html)</br>
[vSAN 中的闪存缓存设备设计注意事项](https://docs.vmware.com/cn/VMware-vSphere/6.5/com.vmware.vsphere.virtualsan.doc/GUID-1D6AD25A-459A-43D6-8FF5-52475499D6A2.html)

### 初时虚拟磁盘文件

ESXi 虚拟机的存储文件主要为 .vmx、.vmsd、.vmdk 等文件，其中对于 .vmdk 文件：

* xx.vmdk：该文件保存的是磁盘的元数据，包括 xx-flat.vmdk 和 xx-ctk.vmdk 文件
* xx-flat.vmdk：该文件为 Extent Description 二级制文件啊，二级制数据保存在此文件中
* xx-ctk.vmdk：该文件为 CTK 文件，CBT（数据块修改跟踪）启动时自动生成

### 快照

快照创建过程中，新增以下文件：

* **-000001.vmdk
* **-000001-ctk.vmdk
* **-000001-delta.vmdk（基础 vmdk 上的变更位图）
* **-Snapshot\*.vmsn（快照状态文件）

#### 快照创建过程简单描述如下

1. 当虚拟机未创建快照时，虚拟机的读写操作直接在 VMDK 文件进行；
2. 当虚拟机创建第一个快照时，这时生成 **-000001-delta.vmdk 和**-000001.vmdk 文件，并立即锁住源 VMDK 文件，将其变为只读状态。虚拟机的写操作均在 **-000001.vmdk 上进行，读操作将在**.vmdk 和 **-000001.vmdk 上进行（具体基于需要读的数据所在位置）；
3. 再次创建快照的原理和之前一样，生成 **-000002-delta.vmdk 和**-000002.vmdk 文件，锁住 **-000001.vmdk 文件，将其变为只读状态。

### 注意点

* 对于有用快照的虚拟机做写操作时，均在新的 vmdk 文件进行，如果数据在父 vmdk 上（被锁住成只读的 vmdk），先将数据拷贝到新的 vmdk 上，再进行修改；
* 当读取某一块数据时，ESXi 需要判断从哪里去读：对于没有修改的数据块，从父 vmdk 读，对于已经修改的数据块，从新的 vmdk 上读。
* 整合多个虚拟机快照时，主机会短暂无响应
