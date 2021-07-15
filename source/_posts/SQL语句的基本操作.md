---
title: SQL 语句的基本操作
date: 2017-04-04 12:44:13
categories: Mysql
tags:
---
### 数据库操作
1. 创建数据库： `CREATE DATABASE <数据库名> [其他选项]`
2. 使用数据库： `USE <数据库名>`
3. 修改数据库： `ALTER DATABASE <数据库名>`
4. 删除数据库： `DROP DATABASE <数据库名>`

<!--more-->

### 数据表操作
1. 创建表：
```
CREATE TABLE <表名>
（
     <列名1><数据类型>[<列级完整性约束>],
    [<列名n><数据类型>[<列级完整性约束>]]
 ）;
例：
    create table studets
    (
        id int not null auto_increment primary key,
        name varchar(8) not null,
        sex varchar(5) not null,
        score int(5) not null
    )
```
2. 修改基本表
```
ALTER TABLE <表名> add <列名> <列数据类型> [after 插入位置];         --增加列
ALTER TABLE <表名> change <列名> <列新名> <新数据类型>;              --修改列
ALTER TABLE <表名> drop <列名>;                         --删除列
ALTER TABLE <表名> rename <新表名>;                     --重命名表
DROP TABLE <表名>                                       --删除表
```
3. 表的基本操作
* 插入数据：`insert [into] <表名> [(列名1,列名2,列名3……)] values (值1,值2,值3……);`
* 更新数据：`update <表名> set 列名=新值 where 更新条件;`
* 删除数据：`delete from <表名> where 删除条件;`
* 查询数据：`select <列名> from <表名> [查询条件];`
* 特定条件查询：where 不仅支持 "where 列名=值" 这种名等于值的查询形式，对一般的比较运算的运算符都是支持的，如=、<、>、！= 等以及一些扩展运算符 is[not] null、in、like 等，还可以对查询条件使用 or 和 and 进行组合查询。

