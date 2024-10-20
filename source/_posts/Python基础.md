---
title: Python基础
categories: Code
tags:
  - Python
abbrlink: 99832f47
date: 2017-04-07 09:25:45
---
*最近在自学Python，所以一边学也一边总结一些知识点*

#### Python的输出
Python的输出和C语言类似，在`print()`函数里加上字符串（用单引号或者双引号，但是不能混用），例如：
```
>>> print('Hello world!')
```
`print()`函数也可以接受多个字符串，用逗号隔开即可。`print()`函数依次打印字符串，每遇到逗号就会输出一个空格。
`print()`也可以打印整数或者计算结果，例如：
<!--more-->
```
>>> print('5+3=',5+3)
```
*注：对于`5+3`，python解释器会自动计算出结果，但是`'5+3='`是字符串而非数学公式*

#### Python的输入
Pyhton提供了`input()`函数，可以让用户输入字符串，并且存到一个变量里，例如：
```
>>> info = input()
```
输入任意字符后按下回车完成输入，输入的内容就被存放在变量`info`里面了。
`input()`函数可以显示一个字符串来提示用户，如：`input('please input something:')`

#### Python的数据类型
* 整数：Python可以处理任意大小的整数，包括负整数。
* 浮点数：与C语言一样，可以用数学法也可以用科学记数法（把10用e替代）表示。
* 字符串：字符串使用单引号或者双引号括起来的任意文本；如果文本中包含`'`和`"`可以用转义字符`\`来表示。
* 布尔值：一个布尔值只有`True`和`False`两种值（注意大小写）；布尔值可以用`and（与运算）`、`or（或运算）`和`not（非运算）`运算。
* 空值：空值是Python里一个特殊的值，用`None`表示。`None`不能理解为0，因为0是有意义的整数，而`None`是一个特殊的空值；类似于C语言里面的`NULL`。
* 变量：和C语言类似，变量名必须是大小写英文、数字和下划线的组合，且不能用数字开头；如：
```
a = 123
```
这种变量本身类型不固定的语言称为动态语言，与之对应的是静态语言。静态语言在定义变量是必须指定变量类型，如：
```
int a = 123
```
和静态语言相比，动态语言更灵活。

* 常量：所谓常量就是不能变的变量，在Python中，通常用全部大写的变量名表示常量。

#### Python的整数除法和取余
* `/`：这种整数的除法得到的结果是浮点数，即使两个整数恰好整除结果也是浮点数。
* `//`：这种除法也称为地板除，两个整数的相除结果仍然为整数，和C语言中的整数除法一样，整数除法结果为小数时取整数部分。
* `%`：与C语言的取余一样，结果为两整数相除的余数。

#### Python的list
list类似于数组的概念，可以随时添加和删除元素；与数组一样，`list[]`的索引是从0开始的，但是访问元素时要确保索引不要越界，可以用`len()`函数来获取元素的个数，如：
```
>>> len(list)       #变量list是一个list
```
所以最后一个元素的索引是`len(list)-1`，当然也可以用`-1`来做索引，直接获取最后一个元素`list[-1]`，以此类推可以用`-2`、`-3`来获取倒数第二个的、倒数第三个元素。

Python提供`lsit.insert()`函数将元素插入到特定的位置，如：
```
>>> list.insert(x,'info')#x为想插入元素位置的索引号，info为想插入的 元素
```
也可以用`list.addend()`函数将元素插入到末尾，如：
```
>>> list.addend('info')     #info为想插入的元素
```
想要删除list末尾元素用`list.pop()`函数，想要删除指定位置的元素，用`list.pop(x)`方法，其中`x`是索引位置。list可以直接赋值，而且list中的元素类型也可以不同。

#### Python的tuple
这是Python的另一个有序列表，叫做元组（tuple）。tuple和list类似，但是tuple一旦初始化就不能进行修改了；我们依然可以使用`tuple[0]`、`tuple[-1]`来获取元素。
由于tuple不可变，所以相比list更加安全，所以能用tuple就尽量使用tuple。下面说一下tuple的定义：
```
>>> tuple = (1,2,3,4)       #正常的tuple定义
>>> tuple = ()      #定义空的tuple
```
但是当定义一个元素的tuple的时候，如果写成这样：
```
>>> tuple = (1)
```
由于小括号`()`既可以表示tuple又可以表示数学公式中的小括号，就产生了歧义。因此，Python规定这种情况下`()`按照数学公式的小括号计算，结果即为`1`，所以，只有一个元素的tuple定义是要加一个逗号`,`来消除歧义：
```
>>> tuple = (1,)
```
*当然了，tuple的元素中如果包含一个list的话，list的元素是可以改变的*

#### Python的条件判断
和C语言类似，Python的条件判断的语法如下：
```
if <判断条件1>:
    <执行代码>
elif <判断条件2>:
    <执行代码>
elif <判断条件3>:
     <执行代码>
        …………
else:
     <执行代码>
```
我们可以通过使用之前说过的`input()`函数的输入进行条件判断，但是有一个需要注意的地方，**`input()`函数返回的数据类型是`str`，不能直接和整数比较，所以必须要先使用`int()`函数将`str`转换为整数。**

#### Python的循环
##### for……in:
这个循环可以将list或tuple中的元素遍历出来，看个例子：
```
num = ['1','2','3','4']
for x in num:
    print(x)
```
执行这段代码，会依次打印每一个元素，所以`for x in ……`就是把每个元素带入变量`x`，然后执行缩进块的语句。有了这个循环我们就可以做求和了，不过我们要从1写到100确实有点困难，幸好Python提供了`range()`函数，可以生成一个整数序列，再通过`list()`函数可以转换为list。如：
```
>>> list(range(5))
[0,1,2,3,4]         #range(5)生成的是从0开始小于5的整数
```
##### while:
和C语言类似，条件满足就循环，条件不满足时就退出循环。语法如下：
```
while <判断条件>
<执行语句>
```
##### break和continue:
和C语言类似，`break`可以提前退出循环，`continue`可以跳过当前循环，直接进入下一次循环。
