---
title: Dict 和 Set
date: 2017-04-12 22:16:27
categories: Code
tags:
- Python
---
#### Dict
Python内置了字典Dict（全称Dictionary），使用键-值（key-value）存储，具有极快的查找速度。Dict的查找原理和查字典类似，key就相当于字典的索引，Python可以通过key计算出所对应的value存放的内存地址，直接取出，所以查找速度快。
Dict的初始化很简单，语法如下：

```
>>> dict = {key1' : value1, 'key2' = value2, 'key3' = value3}
>>> dict['key2']
value2
```
一个key只能对应一个value，所以当我们对一个key多次赋值时会将前一个value覆盖掉。由于需要查找的key不存在时，dict会报错，为了避免key不存在的情况，Python提供了两种方法：
* 通过`in`判断，如果key存在，就返回`True`，反之返回`False`：
```
>>> `key` in dict
```
* 通过`get`判断，如果key不存在就返回None（*返回None的时候交互式命令行不显示结果*），也可以是自己指定返回的内容：
```
>>> dict.get('key')     #返回None
>>> dict.get('key',-1)      #返回自己指定的值`-1`
```
删除Dict可以使用`dict.pop(key)`方法，对应的value也会从dict中删除。
Dict内部的存放顺序和key的放入没有关系，Dict的查找和插入速度不会随着key的增加而变慢，需要占用大量的内存，是一种用空间来换取时间的方法。
#### Set
Set和Dict类似，也是一组key的集合，但是不存储value。由于key不能重复，所以在set中没有重复的key。要创建一个set需要提供一个list作为输入的集合：
```
>>> s = set([1,2,3,4,5])
```
重复的元素会被set自动过滤，可以通过`add(key)`方法向set添加元素，通过`remove(key)`方法删除元素。我们可以将set看作数学意义上的集合，因此，两个set之间可以做数学意义上的交(&)、并(|)集等运算

