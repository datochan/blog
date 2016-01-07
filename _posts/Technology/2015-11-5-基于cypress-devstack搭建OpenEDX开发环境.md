---
layout: post
title: 基于cypress-devstack搭建OpenEDX开发环境
category: 技术文章
tag: [edx, vagrant]
---

已经好久没有重新安装过OpenEDX了，上一次安装的版本还是基于2014年8月份的devstack安装的。总的来说, OpenEDX的安装没有多少好讲的东西, 按照官方的Wiki[$$^1$$](https://github.com/edx/configuration/wiki/edX-Developer-Stack)一步步的操作即可!所以我不会在具体的安装过程中浪费时间,只会整理我在安装过程中遇到的一些问题及解决方法，还会有一些日常开发中的小技巧。<!-- More -->

### edx_ansible中安装脚本playbook学习手记

依稀还记得去年刚开始折腾edx的时候，由于大家都知道的原因，我在安装devstack时安装脚本总是由于网络的问题中断，中断后由于不知道如何继续脚本的执行，就只能重启虚拟机。等虚拟机启动成功后重新开始执行安装脚本。如此折腾经常一个星期下来devstack都没有安装好。现在回头想想很是苦XX……

所以，在这里记录一下我安装devstack的一点儿经验，希望能帮助到跟我一样新手的朋友(各位大神就直接略过吧)。

我们先打开Vagrantfile文件(如果看管您还不知道Vagrantfile是啥, 请到这里[$$^1$$](https://github.com/edx/configuration/wiki/edX-Developer-Stack)恶补), 里面除了下载安装devstack的box文件还有端口及目录映射代码之外还有如下代码(版本不同可能代码稍有出入):

~~~ bash
$script = <<SCRIPT
if [ ! -d /edx/app/edx_ansible ]; then
    echo "Error: Base box is missing provisioning scripts." 1>&2
    exit 1
fi
OPENEDX_RELEASE=$1
export PYTHONUNBUFFERED=1
source /edx/app/edx_ansible/venvs/edx_ansible/bin/activate
cd /edx/app/edx_ansible/edx_ansible/playbooks

# Did we specify an openedx release?
if [ -n "$OPENEDX_RELEASE" ]; then
  EXTRA_VARS="-e edx_platform_version=$OPENEDX_RELEASE \
    -e certs_version=$OPENEDX_RELEASE \
    -e forum_version=$OPENEDX_RELEASE \
    -e xqueue_version=$OPENEDX_RELEASE \
  "
  CONFIG_VER=$OPENEDX_RELEASE
  # Need to ensure that the configuration repo is updated
  # The vagrant-devstack.yml playbook will also do this, but only
  # after loading the playbooks into memory.  If these are out of date,
  # this can cause problems (e.g. looking for templates that no longer exist).
  /edx/bin/update configuration $CONFIG_VER
else
  CONFIG_VER="master"
fi

ansible-playbook -i localhost, -c local vagrant-devstack.yml -e configuration_version=$CONFIG_VER $EXTRA_VARS

SCRIPT
~~~

至此，我们知道虚拟机在vagrant up执行完毕之后, 会加载 ```source /edx/app/edx_ansible/venvs/edx_ansible/bin/activate``` 然后切换到目录 ```cd /edx/app/edx_ansible/edx_ansible/playbooks```底下执行 ```ansible-playbook -i localhost, -c local vagrant-devstack.yml -e configuration_version=$CONFIG_VER $EXTRA_VARS```命令。

也就是说，我们不用每次命令执行失败都重启虚拟机了……

我们再详细分析 ansible-playbook 命令，我们会发现 playbook是一个通用的系统部署脚本, EDX也只是依赖它进行系统的安装部署。查询一下这个命令的用法:

~~~ bash
vagrant@precise64:/edx/bin$ ./ansible-playbook -h
Usage: ansible-playbook playbook.yml
 
Options:
  -k, --ask-pass        ask for SSH password
  --ask-su-pass         ask for su password
  -K, --ask-sudo-pass   ask for sudo password
  --ask-vault-pass      ask for vault password
  -C, --check           don't make any changes; instead, try to predict some
                        of the changes that may occur
  -c CONNECTION, --connection=CONNECTION
                        connection type to use (default=smart)
  ...
  --start-at-task=START_AT
                        start the playbook at the task matching this name
  ... 
~~~

很显眼的我们可以看到 --start-at-task 参数。这样我们就可以指挥脚本系统让它直接从指定的任务开始执行，比如我们的mongo启动失败了，从启动mongo的脚本位置开始执行:

~~~bash
ansible-playbook -i localhost, -c local vagrant-devstack.yml -e configuration_version=$CONFIG_VER $EXTRA_VARS --start-at-task="mongo | start mongo service"
~~~

也许有看官会问: 这个任务名称从哪里来。这个大家只要记录下任务执行失败的位置,或者研究一下 ```/edx/app/edx_ansible/edx_ansible/playbooks/roles/```目录,你会发现这里文件夹的名称是 任务组的名称（也就是任务名称中竖线前面的名字), 具体的任务名称是在相应文件夹下的 ```tasks/default.yml``` 也可能是别的文件具体的依赖关系请大家参考 playbook的文档。 

### 依赖 run_role.yml 来单独安装或修复某个服务

经常的，我们会需要单独安装一些服务组件，比如xqueue或者xserver 等等。之前我是每次都自己去git clone组件代码，然后pip install requirements 组件来安装。可每次都费劲的折腾半天。直到发现了这个playbook的配置才发现一切原来都这么简单:

这里以 xserver 服务为例:

~~~ bash

cd /edx/app/edx_ansible/edx_ansible/playbooks 
# 更新 configuration
sudo /edx/bin/update configuration release-kifli

~~~

编辑任务脚本文件: ```/edx/app/edx_ansible/edx_ansible/playbooks/roles/xserver/defaults/main.yml ```

~~~ yaml

# 设置如下变量的内容
XSERVER_GRADER_DIR: "{{ xserver_data_dir }}/data/content-test-xserver"
XSERVER_GRADER_SOURCE: "https://github.com/antoviaque/xserver-grader.git"
XSERVER_LOCAL_GIT_IDENTITY: "{{ secure_dir }}/files/git-identity"

~~~

执行如下脚本开始安装xserver服务。

~~~ bash

/edx/app/edx_ansible/venvs/edx_ansible/bin/ansible-playbook -i localhost, -c local run_role.yml -e 'role=xserver'

~~~

如此，等待组件安装完成即可!

这里再举一个安装mongodb时自动创建相应用户的bash脚本:

~~~ bash

#fix-mongo.sh
#!/bin/bash

apt-get purge mongodb-10gen
cd /edx/app/edx_ansible/edx_ansible/playbooks
# 更新 configuration
sudo /edx/bin/update configuration release-kifli
/edx/app/edx_ansible/venvs/edx_ansible/bin/ansible-playbook -i localhost, -c local run_role.yml -e 'role=mongo' -e 'mongo_create_users=True'

mongo localhost <<EOF
use edxapp;
 
db.createUser({
    user: "edxapp",
    pwd: "password",
    roles: [ "readWrite" ]
});
 
use cs_comments_service;
 
db.createUser({
    user: "cs_comments_service",
    pwd: "cs_comments_service",
    roles: [ "readWrite" ]
});
EOF

~~~

### 基于PyCharm下开发及调试环境的搭建

OpenEdx的开发环境非常灵活, 在官方的Wiki中就有介绍PyCharm使用的介绍。还是有朋友问我PyCharm的配置相关的问题，这里我将我的配置分享出来:

* Django项目
我们说的edxplatform中的lms、cms项目都是django项目。这种项目的配置不麻烦，先配置远程的python解析器:

![使用虚拟机中的python解析器]({{site.resource_url}}/uploads/2015-11-5/remote_interpreter.png)

项目的配置如下:

![项目的配置图]({{site.resource_url}}/uploads/2015-11-5/project_configure.png)

预览项目:

![预览一下调试效果]({{site.resource_url}}/uploads/2015-11-5/preview.png)

* Gunicorn项目

Django代码自然是可以在 Gunicorn下跑的，这里说的是跑在Gunicorn中的普通python代码, 如:xserver下code grader代码或xblock插件代码的调试。

![启用gevent]({{site.resource_url}}/uploads/2015-11-5/enable_gevent.png)

项目的配置方法:

![Gunicorn项目的配置]({{site.resource_url}}/uploads/2015-11-5/gunicorn_configure.png)

### 共用一个cypress虚拟机进行多个EDX项目的开发

最开始有不用vagrant启动虚拟机的想法是因为公司的网络问题。在公司只要连接网络, vagrant up命令就会超时。而这种情况在家里或者别的地方都没有这种问题。再就是vagrant启动的速度太慢，每次都要清理掉之前的配置重新设置配置项。再后来，有多个edx项目代码要开发。用vagrant就得配置多个虚拟机。这个对于我们这些SSD盘只有128G或者256G的开发人员来说虚拟机硬盘的开销不可谓不大。

再想想vagrant在开发中起到的作用也无非也就是控制虚拟机，设置共享文件夹和端口映射(可能vagrant的作用更多,毕竟我不专业也没深入研究,随口这么一说大家别较真儿)。所以这里记录一下多个edx代码共用同一个vbox的方法。

安装完devstack之后关闭虚拟机, 用virtualBox设置一下端口映射: 点击 网络->网卡1->高级中进入设置界面，如下图(如果你用vagrant已经启动过一次虚拟机了那端口映射应该已经设置好了):

![虚拟机设置端口映射]({{site.resource_url}}/uploads/2015-11-5/port_mapping.png)

共享文件夹, 将要挂载的文件夹制定好(不要设置自动挂载, 因为自动挂载的目录不是我们想要的路径), 如下图:

![虚拟机设置共享文件夹]({{site.resource_url}}/uploads/2015-11-5/share_folder.png)

设置完成后, 用virtualBox以无界面的方式启动虚拟机。启动虚拟机后，执行如下命令:

~~~ bash
sudo mount -t vboxsf src /edx/src
sudo mount -t vboxsf ora /edx/app/ora/ora
sudo mount -t vboxsf insights /edx/app/insights
sudo mount -t vboxsf themes /edx/app/edxapp/themes
sudo mount -t vboxsf programs /edx/app/programs/programs
sudo mount -t vboxsf ecommerce /edx/app/ecommerce/ecommerce
sudo mount -t vboxsf edx-platform /edx/app/edxapp/edx-platform
sudo mount -t vboxsf analytics_api /edx/app/analytics_api/analytics_api
sudo mount -t vboxsf cs_comments_service /edx/app/forum/cs_comments_service
sudo mount -t vboxsf ecommerce-worker /edx/app/ecommerce_worker/ecommerce_worker

~~~

可能默认的虚拟机已经创建了 edx-platform 和 themes俩文件夹。就不需要创建直接挂载即可。
到这里我们可以直接以ssh的方式进入虚拟机，用法跟vagrant ssh一样。

* 目录
{:toc}
