---
hero:
  title: Socket-Manager
  desc: Socket请求响应处理模块
  actions:
    - text: Getting Started
      link: /getting-started
features:
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/881dc458-f20b-407b-947a-95104b5ec82b/k79dm8ih_w144_h144.png
    title: 调度任务
    desc: 集中管理请求和响应
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/d60657df-0822-4631-9d7c-e7a869c2f21c/k79dmz3q_w126_h126.png
    title: 追踪
    desc: WebSocket 并发消息时追踪响应结果
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/d1ee0c6f-5aed-4a45-a507-339a4bfe076c/k7bjsocq_w144_h144.png
    title: 调用友好
    desc: 独立的 Socket 管理实例，丰富的异常处理，响应结果处理
footer: Open-source MIT Licensed | Copyright © 2020<br />
---

## Hello Socket-Manager!

这是一个 Socket 请求响应处理模块。

如果你的 webSocket 服务端需要发消息表示客户端每条 socket 消息的结果（成功或失败）。

如果你想：

优雅地管理 socket 消息队列；

实现请求消息和响应消息一一对应；

在 WebSocket 并发消息时追踪响应结果；

可以使用 SocketManager！

Socket.io、WebSocket 连接模式都适用。

## 优势

独立的 Socket 管理实例。

丰富的异常处理，响应结果处理。

解决了 WebSocket 并发消息时响应结果难以追踪的问题。

兼容 Socket.io 和 WebSocket 两种连接模式。

可以在 Socket 通信业务代码中方便地使用。

## 设计思想

参考了 AJAX 的设计模式。模仿浏览器的 XMLHttpRequest 对象，构造函数 SocketManager 内部集成发送请求、监听事件(success，error，timeout)、断开连接、中止响应等方法。
