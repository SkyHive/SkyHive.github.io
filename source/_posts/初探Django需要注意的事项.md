---
title: 初探Django需要注意的事项
date: 2018-03-25 20:55:33
categories: Code
tags: 
- Django
---
#### 更改默认数据库为MySQL

Django使用的默认数据库是SQLite3，如果习惯使用的是SQLite的用户就可以不必更换数据库。

更换数据库的话在`settings.py`文件中`DATABASES`选项中进行更改
<!--more-->
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': '项目对应的数据库名称',
        'USER': '登录mysql的帐户',
        'PASSWORD': '登录mysql的密码',
        'HOST': '127.0.0.1',	#由于是在本地开发，所以是127.0.0.1
        'PORT': '3306'	#这里mysql使用的是默认的3306端口
    }
}
```

#### 设置Templates的路径

在`settings.py`文件中的`TEMPLATES`选项中进行设置

```python
'DIRS': [os.path.join(BASE_DIR, 'templates')]
```

其中`BASE_DIR`是项目的绝对路径，设置过`Templates`路径之后`Django`会在改路径下的`templates`文件夹下搜索对应的`html`文件。

#### 设置中文

`settings.py`最后有个选项为`LANGUAGE_CODE`，这个选项是设置`Django`语言的。`Django`为我们提供了很多自带的应用，如果习惯了看英文的话可以不用设置，直接使用默认的英语，如果英语看着膈应的话，可以设置为中文`zh-hans`或者`zh_Hans`

#### 添加创建的应用

当你新建应用之后要记得在`settings.py`中的`INSTALLED_APPS`选项中添加新建的应用——直接在最后一行添加新建的应用名就好了。

#### 修改数据默认显示名称

在创建的数据类下面添加一个方法，根据Python的版本进行选择

```python
python 2.7 : __unicode__(self)
python 3 : __str__(self)
然后在方法中返回self.var	#var是类中数据中用来显示数据的变量
```

#### Tamplates 过滤器

这个过滤器其实可以说就是Linux下的管道符`|`，Linux玩的转的人对这个一定不会陌生，过滤器的基本形式就像这样

```python
{{var | filter}}
```

有些过滤器会跟有参数，过滤器的参数都是跟随冒号，例如

```python
{{var | default:'0'}}	#为变量var设置默认值0
```