# socket-manager
Socket请求响应处理模块。
构造函数SocketManager模仿浏览器的XMLHttpRequest对象，内部集成发送请求、监听事件(success，error，timeout)、断开连接、中止响应等方法。管理实例内部消息列表，实现请求消息和响应消息一一对应，以及异常处理，响应结果处理等功能。解决了WebSocket并发消息时响应结果难以追踪的问题。
优势：封装独立的Socket管理实例。可以在Socket通信业务代码中方便地使用。
此实例调用体验友好，与fetch请求使用方法类似。

使用方法：

