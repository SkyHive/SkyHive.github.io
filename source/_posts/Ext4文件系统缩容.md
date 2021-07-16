---
title: Ext4文件系统缩容
date: 2019-10-31 12:32:00
categories: Infra
tags:
- Filesystem
---
由于 `XFS` 文件系统不支持缩容，所以这里只讨论 `Ext4` 缩容的情况。

`Ext4` 文件系统调整的命令为 `resize2fs`，在使用这个命令前，我们需要将我们需要缩容的文件系统所在分区进行调整，由于 `LVM` 的调整相对简单，这里不做描述。

如果需要调整的分区非系统盘，则可以直接先卸载已挂载的文件系统，然后进行操作；若需要调整的分区在系统盘上，则需要进入 `LiveCD` 的 `shell` 环境进行操作。

```
sudo -i
 
 
## 文件系统缩容
e2fsck -f /dev/sda4
resize2fs /dev/sda4 <想要变成的大小>（如 200G）
 
 
## 缩小分区
fdisk /dev/sda
 
 
# 键入 p 查看当前分区信息，记下要缩小的分区的 start 值
 
 
# 键入 d 选择要删除的分区
 
 
# 键入 n 新建分区，确认 start 值为刚刚原分区记录下来的 start 值
# end 设置为 +<你想要的大小>（如 +200G）
 
 
# 键入 p 确认分区大小没有问题后，键入 w 保存退出
 
 
# 重新 resize 文件系统
resize2fs /dev/sda4
```
