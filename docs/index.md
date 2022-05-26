## Hello socket-manager!

这是一个 Socket 请求响应处理模块。

如果你的 webSocket 服务端需要发消息表示客户端每条 socket 消息的结果（成功或失败）。

如果你想：

优雅地管理消息列表；

实现请求消息和响应消息一一对应；

在 WebSocket 并发消息时追踪响应结果；

可以使用 SocketManager！

## 优势

独立的 Socket 管理实例。

可以在 Socket 通信业务代码中方便地使用。

丰富的异常处理，响应结果处理.

## 设计思路

模仿浏览器的 XMLHttpRequest 对象，构造函数内部集成发送请求、监听事件(success，error，timeout)、断开连接、中止响应等方法。
