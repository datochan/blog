---
layout: post
title: python和javascript共用的base64加解密代码
slug: use-base64-within-python-and-javascript
category: 技术文章
tag: [code, python, coffeescript, base64]
---

最近在OpenEDX中开发了个新的组件，其中需要支持上传功能。由于全都是异步操作，而一些现有的文件上传的库都失效不可用。所以想自己将文件编码成base64，扔到服务端，服务端接收解码保存，以此来实现文件上传的功能。之前在javascript中加解密部分一直喜欢用CryptoJS库。<!-- more -->
结果发现此库对数据Base64编码后，python的base64库解密不出来。后来更换了[js-base64](https://github.com/dankogai/js-base64) 这个库，还是不行，于是自己用coffeescript写了一个。这里存档，以备后用。

### python和javascript共用的base64加解密代码

代码如下:

~~~ coffeescript
class CSTBase64
    @_keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    @encode = (s) ->
        res = []
        leftover = s.length % 3
        end = s.length - leftover
        for i in [0 .. end] by 3
            c2 = s.charCodeAt(i);
            c1 = s.charCodeAt(i+1);
            c0 = s.charCodeAt(i+2);
            res.push(@_keyStr[(c2 >> 2) & 0x3f])
            res.push(@_keyStr[((c2 & 0x3) << 4) | ((c1 >> 4) & 0x0f)])
            res.push(@_keyStr[((c1 & 0x0f) << 2) | ((c0 >> 6) & 0x03)])
            res.push(@_keyStr[c0 & 0x3f])

        i += 3
        if leftover == 1
            c2 = s.charCodeAt(i);
            res.push(@_keyStr[(c2 >> 2) & 0x3f])
            res.push(@_keyStr[(c2 & 0x3) << 4])
            res.push(@_keyStr[-1..])
            res.push(@_keyStr[-1..])

        else if leftover == 2
            c2 = s.charCodeAt(i);
            c1 = s.charCodeAt(i+1);
            res.push(@_keyStr[(c2 >> 2) & 0x3f])
            res.push(@_keyStr[((c2 & 0x3) << 4) | ((c1 >> 4) & 0x0f)])
            res.push(@_keyStr[(c1 & 0x0f) << 2])
            res.push(@_keyStr[-1..])

        return res.join("")


    @decode = (s)->
        res = []
        end = len(s)
        if s[-1] == @_keyStr[-1..]
            end -= 4

        for i in [0 .. end] by 4
            c3 = @_keyStr.indexOf(s[i])
            c2 = @_keyStr.indexOf(s[i+1])
            c1 = @_keyStr.indexOf(s[i+2])
            c0 = @_keyStr.indexOf(s[i+3])

            res.push(String.fromCharCode(((c3 << 2)) | ((c2 >> 4) & 0x03)))
            res.push(String.fromCharCode(((c2 & 0x0f) << 4) | ((c1 >> 2) & 0x0f)))
            res.push(String.fromCharCode(((c1 & 0x03) << 6) | (c0 & 0x03f)))

        if end < len(s)
            if s[-2] == @_keyStr[-1..]
                c3 = @_keyStr.indexOf(s[end])
                c2 = @_keyStr.indexOf(s[end+1])
                res.push(String.fromCharCode(((c3 << 2)) | ((c2 >> 4) & 0x03)))
            else
                c3 = @_keyStr.indexOf(s[end])
                c2 = @_keyStr.indexOf(s[end+1])
                c1 = @_keyStr.indexOf(s[end+2])

                res.push(String.fromCharCode(((c3 << 2)) | ((c2 >> 4) & 0x03)))
                res.push(String.fromCharCode(((c2 & 0x0f) << 4) | ((c1 >> 2) & 0x0f)))
        return res.join("")
~~~


* 目录
{:toc}

