---
layout: post
title: 基于cypress-devstack搭建OpenEDX开发环境
category: 技术文章
tag: [edx, vagrant]
---

已经好久没有重新安装过OpenEDX了，上一次安装的版本还是基于2014年8月份的devstack安装的。总的来说, OpenEDX的安装没有多少好讲的东西, 按照官方的Wiki[$$^1$$](https://github.com/edx/configuration/wiki/edX-Developer-Stack)一步步的操作即可!所以我不会在具体的安装过程中浪费时间,只会整理我在安装过程中遇到的一些问题及解决方法，还会有一些日常开发中的小技巧。<!-- More -->
### edx_ansible中安装脚本playbook学习手记

### 依赖 run_role.yml 来单独安装或修复某个服务

### 安装 cypress-devstack 时遇到的问题

### 基于PyCharm下开发及调试环境的搭建

#### Django项目

#### Gunicorn项目
Django代码自然是可以在 Gunicorn下跑的，这里说的是跑在Gunicorn中的普通python代码, 如:xserver下code grader代码或xblock插件代码的调试。

### 抛开vagrant,让多个OpenEDX项目共用一个cypress虚拟机进行开发



* 目录
{:toc}
