---
nav:
  title: 贡献
  order: 3
---

## 关于贡献代码

1. 先 fork [源仓库](https://github.com/xiyanma/xiyanma.github.io)到自己的 github 上
2. clone 自己的项目后，更新方法、组件
3. 提交到 github 后提 pr 到[源仓库](https://github.com/xiyanma/xiyanma.github.io)
4. 分配其他人 review 和合代码
5. 去源仓库`lerna run publish`发布到 npm

## 测试用例

1. 原则上是逻辑计算类的公共方法都需要写测试用例

## 修改 components 和提交注意事项

修改通用方法时，不能影响已有代码功能逻辑，提交代码后最好是提 PR 让其他同事 CR 一下

## 发版注意事项

通常来说，发版只需要发某个 package，发版使用 np 来规范流程

## 规范说明

## 文档贡献说明

可以设置检索目录，通常文档放在 docs 下，以 docs 为例

1. 如果不在`config/menus/index.ts`中显示的声明路由，则会以 docs 为根路径('/')，以文件夹结构作为默认 path
2. 如何快速添加 Navs(页面右上角导航按钮)，`config/config.ts/navs`
3. [其他参考](https://d.umijs.org/zh-CN/config)

## lerna 相关

1. [命令文档](http://www.febeacon.com/lerna-docs-zh-cn/routes/basic/about.html)
2. [谁在使用](https://www.lernajs.cn/#users)

## help

I am looking for a good job :)

联系：2577014618@qq.com
