---
title: OpenClaw 搭建 Hexo 博客自动化工作流
categories: 技术相关
tags:
  - OpenClaw
  - Hexo
  - 自动化
  - AI
abbrlink: af30f29e
date: 2026-02-28 15:12:00
---


# OpenClaw 搭建 Hexo 博客自动化工作流

> 把重复的命令交给 AI，写博客应该专注于内容

---

## 一、背景

### 一个运维的自我修养

作为一个运维工程师，我的日常是这样的：

```bash
# 早上到公司
kubectl get pods  # 嗯，都活着

# 下午开会
# 脑子：这个架构有问题
# 嘴：我觉得还行，再观察观察

# 晚上写博客
hexo new post "今天学了个新东西"
# 编辑两小时...
git add .
git commit -m "更新"
git push
hexo clean && hexo generate && hexo deploy
```

等等，我是不是忘了什么？哦对，**我只是想写篇博客，不是要考 RHCE 认证啊！**

### 于是我开始"偷懒"

最近我在折腾一个很火的开源框架 —— **OpenClaw**。

**OpenClaw 是什么？**

简单来说，它是一个 **AI 助手框架**，能：

- 读取你的文件、日历、邮箱
- 帮你执行命令、管理任务
- 通过自然语言对话完成各种工作

它的核心理念是：**让 AI 成为你的第二个大脑**，帮你处理重复性工作，你只需要专注于决策和创造。

**听起来很美好，但真的能用吗？**

抱着怀疑的态度，我决定拿它来测试一下：**能不能帮我把博客写作流程自动化？**

毕竟，如果一个 AI 连 `hexo new post` 都搞不定，那它也不配待在我的工作流里。

---

## 二、和 AI 一起优化博客流程

### 第一次对话：需求描述

我没有写任何脚本，只是打开 OpenClaw，输入了这样一段话：

> "我想用 OpenClaw 自动化我的 Hexo 博客写作流程。每次写文章都要手动执行 hexo new、git commit、hexo deploy 等命令，太麻烦了。你能帮我创建一个 Skill 吗？"

AI 很快理解了需求，并反问我几个关键问题：

1. 博客仓库在哪里？（本地路径、Git 地址）
2. 分支结构是什么？（我的是 `hexo` 分支写作，`master` 分支部署）
3. 需要哪些核心功能？（创建草稿、发布、预览、删除等）
4. 分类和标签有没有默认配置？

整个过程就像在和一个懂技术的同事讨论需求，**不需要写任何代码**。

### 第二次对话：流程设计

基于我的回答，AI 设计了一个简化后的工作流：

**优化前（7 步手动操作）：**

```
1. hexo new post "标题"
2. 打开编辑器写文章
3. 保存文件
4. git add .
5. git commit -m "xxx"
6. git push
7. hexo deploy
```

**优化后（3 个命令）：**

```
1. blog draft "标题" 技术 标签  → 创建草稿
2. blog serve --drafts         → 本地预览
3. blog publish "标题"         → 发布 + 部署
```

### 第三次对话：细节打磨

在实现过程中，我们又通过自然语言讨论了一些细节：

> "分类能不能自动映射？比如我输入 `技术` 就自动变成 `技术相关`"

> "发布的时候能不能自动 git commit 和 push？我不想每次都手动操作"

> "预览的时候希望能看到草稿，有没有 `--drafts` 参数？"

AI 逐一实现了这些需求，经过几轮对话，一个完整的博客自动化 Skill 就诞生了。

**重点是：整个过程我没有写一行代码，只是用自然语言和 AI 对话。**

---

## 三、关键代码与使用方法

### 核心脚本结构（AI 生成的）

AI 帮我创建的 Blog Skill 位于 `~/.openclaw/skills/blog/`，核心是一个 Bash 脚本：

```bash
#!/bin/bash
set -e

BLOG_DIR="/home/skyhive/.openclaw/workspace/projects/blog"
HEXO="pnpm exec hexo"

cd "$BLOG_DIR"

# 创建草稿
create_draft() {
    local title="$1"
    local category="$2"
    shift 2 || true
    local tags=("$@")
    
    echo "📝 创建草稿：$title"
    $HEXO new draft "$title"
}

# 发布草稿
publish_draft() {
    local title="$1"
    
    echo "📤 发布草稿：$title"
    $HEXO publish "$title"
    
    git add .
    git commit -m "feat: 发布文章 - $title"
    git push origin hexo
}

# 本地预览
serve() {
    local port="4000"
    local include_drafts=""
    
    while [ $# -gt 0 ]; do
        case "$1" in
            --drafts|-d) include_drafts="--drafts" ;;
            [0-9]*) port="$1" ;;
        esac
        shift
    done
    
    $HEXO server $include_drafts --port $port
}

# 主逻辑
case "$1" in
    draft) shift; create_draft "$@" ;;
    publish) shift; publish_draft "$@" ;;
    serve) shift; serve "$@" ;;
    *) echo "Usage: blog {draft|publish|serve}"; exit 1 ;;
esac
```

### 创建软链接

AI 帮我创建了一个全局命令：

```bash
ln -sf /home/skyhive/.openclaw/skills/blog/blog.sh ~/.local/bin/blog
```

### 最终使用方式：自然语言对话

现在，我不需要记住任何命令，只需要和 AI 对话：

```
我：帮我写一篇关于 K8s 部署的文章
AI：好的，分类是"技术相关"吗？需要加什么标签？

我：标签加 Linux 和 K8s
AI：📝 已创建草稿《K8s 部署最佳实践》，要现在预览吗？

我：预览
AI：🌐 本地服务器已启动，访问 http://localhost:4000

# 编辑完成后...

我：发布这篇文章
AI：📤 已发布并推送到远程，Vercel 正在部署...
```

**是的，最终的使用方式就是：用自然语言和 AI 对话，剩下的交给它。**

### 命令行方式（可选）

如果你更喜欢命令行，也可以直接使用：

```bash
# 创建草稿
blog draft "K8s 部署最佳实践" 技术 Linux K8s

# 本地预览
blog serve --drafts

# 发布文章
blog publish "K8s 部署最佳实践"

# 其他命令
blog list          # 列出文章
blog stats         # 统计信息
blog delete draft  # 删除草稿
```

---

## 四、总结

通过 OpenClaw 的 Skill 系统，我把博客写作流程从 **7 步手动操作** 简化为 **和 AI 对话**：

| 操作 | 之前 | 现在 |
|------|------|------|
| 创建文章 | `hexo new post` | "帮我写篇关于 xxx 的文章" |
| 预览 | `hexo server --drafts` | "预览一下" |
| 发布 | `git + hexo deploy`（5 步） | "发布这篇文章" |

### 核心收获

1. **OpenClaw 不只是聊天机器人** — 它能真正帮你执行任务、自动化工作流
2. **和 AI 对话要清晰** — 明确需求、提供上下文、多轮迭代，才能得到好结果
3. **最好的工具是"无工具"** — 用自然语言对话，比记住一堆命令更高效
4. **自动化是为了专注** — 把重复的事情交给 AI，你只需要关注内容创作

写博客应该专注于内容，而不是重复的命令。

---

## 参考

- [OpenClaw 文档](https://docs.openclaw.ai)
- [Hexo 官方文档](https://hexo.io)
- [Butterfly 主题](https://github.com/jerryc127/hexo-theme-butterfly)
