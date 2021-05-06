---
layout: post
title: 在xblock-sdk中使用makotemplates
slug: use-makotemplates-within-xblock-sdk
category: 技术文章
tag: [web,edx]
---

在xblock-sdk中编写插件时，代码中没有办法使用中文。初次遇到这个问题时并没有往心里去，自以为代码中用英文等最后通过i18n_tool翻译成中文也就是了。
今天在一份试卷中插入了两个主观题，由于每个xblock都会将相应的js代码引入到当前页面中，结果可想而知: js代码函数重定义。<!-- more -->
用String.format方式对js代码进行替换关键字无果(js中'{}'是String.format的关键字)。没有办法只能将js代码以字符串的形式写在了python文件中，弄的心里好一顿不舒服，总觉得要是能将mako templates放到xblock中使用就完美了。

### 在xblock-sdk中使用makotemplates

研究了下xblock-sdk的API，发现 pkg-resources 只是简单的读取字符串操作。mako templates只需要render一下就可以将mako模板变成相应的字符串了。所以在xblock中使用mako应该不需要折腾直接用mako代替pkg-resources即可。直接上代码:

~~~ python

from mako.template import Template

# 载入模板文件
mako_template = Template(filename=os.path.dirname(__file__)+"/static/html/subjective_view.html")
html_str = mako_template.render_unicode(module_title=module_title,
                                        question= self.question,
                                        module_weight=self.weight,
                                        answer=self.student_answers,
                                        module_id=self.location.block_id)

frag = Fragment(html_str)
# 载入css文件
mako_template = Template(filename=os.path.dirname(__file__)+"/static/css/subjective.css")
frag.add_css(mako_template.render_unicode())

# 载入js脚本, 传递参数也不仅限于html模板。
mako_template = Template(filename=os.path.dirname(__file__)+"/static/js/src/subjective_student.js")
frag.add_javascript(mako_template.render_unicode(xblock_id=self.location.block_id))

~~~

如此导入的html、css、js，中文可以随便写，变量也可以随便替换了。如下代码:

~~~ javascript
    // 这里可以写中文注释
    function SubjectiveEditBlock_${xblock_id}(runtime, element){
        // 绑定按钮事件
        $("#${xblock_id} button:submit").bind('click', function(){
            $("#${xblock_id} button:submit+p").css("display", "none");
            var handlerUrl = runtime.handlerUrl(element, 'student_submit');
        ...
~~~

最后不要忘记在你的模板中加入 ```## coding: utf-8``` , 到这里引入mako就完成了。


* 目录
{:toc}

