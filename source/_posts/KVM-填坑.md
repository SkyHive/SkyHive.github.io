---
title: KVM 填坑
categories: 技术相关
tags:
  - KVM
  - 虚拟化
abbrlink: 84d7a5a0
date: 2020-09-06 17:35:31
---
### 1、UEFI 引导问题
支持 KVM 虚拟机使用 UEFI 引导需要安装 OVMF 组件，参考[基于 CentOS 安装 KVM](https://blog.skyhive.tech/2020/06/10/%E5%9F%BA%E4%BA%8E-CentOS-%E5%AE%89%E8%A3%85-KVM/)。
目前通过 virt-v2v 导入的 ova 且使用 UEFI 启动的虚拟机（from vSphere）再 define domain 的时候会有报错，报错如下：
```
error: Failed to define domain from /tmp/v2vlibvirt20e61b.xml
error: unsupported configuration: smm is not available with this QEMU binary
```
以上报错是 OVMF 的问题，参考：https://access.redhat.com/discussions/3175901

具体是因为因为 “OVMF_CODE.secboot.fd” 固件在当前的 qemu-kvm 中不受支持，RedHat Discussion 上有两种解决方案：

1. 重构 OVMF RPM 包，参考： https://access.redhat.com/discussions/3175901
    >  Removing "-D SMM_REQUIRE", rebuild the rpm, browse inside the rpm and then copy OVMF_CODE.secboot.fd to /usr/share/OVMF/OVMF_CODE.fd makes it work but I don't know whether this will reduce security.

2. 升级 qemu-kvm 版本至 2.6 以上的 qemu-kvm-rhev 版本
    > 'With this update, the "OVMF_CODE.secboot.fd" firmware binary file includes the Secure Boot feature. This binary can be used with pc-q35-rhel7.3.0 and later Q35 machine types only [...]'<br>Those machine types are unavailable when using the 1.5.3-based "qemu-kvm" package of base RHEL. They are available only when using the 2.6.0-based "qemu-kvm-rhev" package, which is not part of base RHEL.

未完待续……
