---
title: SQL 进阶
categories: Infra
tags:
  - MySQL
abbrlink: 5a67733d
date: 2017-04-17 17:04:51
---
我们都知道 select 的基本用法`select <字段名> from <表名> [where <限制条件>]`，然而`select`语句后面还可以跟很多限制条件。我们这次用 user 表来作为示范，下面是 user 表的结构：
<!--more-->
![user 表结构](https://blogpic.skyhive.tech/pic%2Fuser.png)
#### Between、And、In、<=、>=、<、>等条件查询：
通过`select * from table where id between 1 and 3`和`select * from table where id >=1 and id <= 3 `的返回结果，我们可以发现`between and`和`>= and <=`是等同的。
![between](https://blogpic.skyhive.tech/pic%2Fbetween.png)
![between2](https://blogpic.skyhive.tech/pic%2Fbetween2.png)

如果我们要查询的条件不是一个连续的数值，可以用`in`：
```
select * from table where id in (2,4)
```

#### locate()函数：`locate(substr,str)`
这个函数返回`substr`在字符串`str`中的第一个出现的位置，如果不存在则值为0
![locate 函数](https://blogpic.skyhive.tech/pic%2Flocate.png)
#### Count()函数:
* count(字段名)：返回指定列的值的数目，但是字段值为`NULL`时不会被计算进去。`select count(字段名) from <表名>`
* count(* )：返回表中的记录数，字段值为`NULL`时会被计算进去。`select count(*) from <表名>`

#### Distinct语句：
Distinct语句用于去除重复行，比如：`select distinct * from <表名>`。
其他的语句或函数都可以和`distinct`配合使用，比如：`count(distinct <字段名>)`可以去除重复行统计行数，但是`count(distinct *)`是**不被允许**的

#### Union语句：
Union语句可以将两个`select`语句的结果集组合成一个：
```
(select * from table where id >= 3) union (select * from table where id = 1)
```
当我们使用`union`语句的时候，默认去除了重复行，和`distinct`的效果一样，如果要显示所有的结果，则要使用`union all`语句。

#### Drder by语句：
```
select * from table order by <字段名> [asc/desc]
```
其中`asc`是默认的排序，为升序，`desc`为降序。
当然order by后面可以跟很多个字段，如：`select * from table order by info desc,id asc`,这个语句意为先按`info`字段降序，若`info`字段值相同的情况下，再按`id`字段升序。而且，`NULL`默认为值最小。

