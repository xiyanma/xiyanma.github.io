## socket-manager

Hello socket-manager!

这是一个 Socket 请求响应处理模块。

如果你的 webSocket 服务端需要发消息表示客户端每条 socket 消息的结果（成功或失败）。

如果你想：

优雅地管理 socket 消息队列；

实现请求消息和响应消息一一对应；

在 WebSocket 并发消息时追踪响应结果；

可以使用 SocketManager！

## 优势

独立的 Socket 管理实例。

丰富的异常处理，响应结果处理。

解决了 WebSocket 并发消息时响应结果难以追踪的问题。

兼容 Socket.io 和 WebSocket 两种连接模式。

可以在 Socket 通信业务代码中方便地使用。

## 设计思想

参考了 AJAX 的设计模式。模仿浏览器的 XMLHttpRequest 对象，构造函数 SocketManager 内部集成发送请求、监听事件(success，error，timeout)、断开连接、中止响应等方法。

## Getting Started

Install dependencies & lerna bootstrap

```bash
$ npm run begin
```

Start the dev server,

```bash
$ npm run start
```

[浏览器预览](http://localhost:8000)
Build site app,

```bash
$ npm run build
```

部署文档

```js
npm run deploy
```

## 如何在项目中安装、使用

```js
// 在项目中安装依赖
npm i xiyanma-socket-manager
npm i xiyan-socket-connect
// 在项目中使用
import SocketManager from 'xiyanma-socket-manager'
mySocket = new SocketManager(tmpSocket);
```

如何在 Apackage 中使用 Bpackage 进行本地开发

```js
lerna add b --scope a
```

## 依赖的协议

如果你想使用 SocketManager 管理消息，通信需要遵守以下私有协议，以发消息为例，监听消息同理。

客户端发消息

```ts
socket.send('api', {
  // "type": "", 可以自定义哦
  // "mod": "",
  // "args": { }
});
```

服务端发消息

表示成功的消息

```ts
io.emit('apiSuccess', {});
```

表示失败的消息

```ts
io.emit('apiFail', {});
```

## 使用示例

（客户端）

建立连接

```js
SocketConnect.init()
  .then((_socket) => {
    this.socket = _socket;

    this.setState(
      {
        isWSS: !!_socket.isWSS,
        // connectState: ACTION_STATE.SUCCESS,
      },
      () => {
        this.init();
      },
    );
  })
  .catch((e) => {
    this.setState({
      connectState: ACTION_STATE.FAIL,
    });
  });
```

挂载实例，管理 Socket 消息

```ts
import SocketManager from 'xiyanma-socket-manager';
let mySocket: SocketManager;
tmpSocket = io(`http://localhost:${port}`, {
  path: '/socket.io',
  transports: ['websocket'], // 强制配置websocket，避免默认使用轮询
  forceNew: true,
  reconnectionAttempts: 3,
  timeout: 2000,
});

mySocket = new SocketManager(tmpSocket);

mySocket.listening({
  port,
});
```

发送消息

```ts
mySocket
  .send(data)
  .then(() => {})
  .catch(() => {})
  .finally();
```

## 业务侧功能示例及协议展示，以打印服务为例

查询打印软件版本

```ts
export const init = () => {
  const data = {
    type: 'init',
    mod: 'system',
    args: {
      mid: merchantId,
    },
  };
  return mySocket.send(data);
};
```

构造单向请求，查询打印机列表;

```ts
export const getPrinterList = async () => {
  if (!tmpSocket?.connected) {
    await ConnectSocket(merchantId);
  }
  // 查询打印机列表
  const data = {
    type: 'getPrinters',
    mod: 'printer',
    args: {},
  };
  return mySocket.send(data);
};
```

断开连接

```ts
export const disConnect = () => {
  mySocket.disconnect();
};
```

## socket.io 服务端调试工具

https://amritb.github.io/socketio-client-tool/#eyJsaXN0ZW4iOlsib2siLCJzb2NrZXRpby1jbGllbnQiLCJtZXNzYWdlIiwiYXBpU3VjY2VzcyIsImFwaUZhaWwiXSwiZW1pdCI6WyJhcGkiLCJhcGkiLCJzb2NrZXRpby1jbGllbnQiLCJzb2NrZXRpby1jbGllbnQtYWNrIl0sImNvbmZpZyI6IntcInBhdGhcIjogXCIvc29ja2V0LmlvXCIsIFwiZm9yY2VOZXdcIjogdHJ1ZSwgXCJyZWNvbm5lY3Rpb25BdHRlbXB0c1wiOiAzLCBcInRpbWVvdXRcIjogMjAwMH0ifQ==

## 关于贡献代码

1. 先 fork [源仓库](https://github.com/xiyanma/socket-manager)到自己的 github 上
2. clone 自己的项目后，更新方法、组件
3. 提交到 github 后提 pr 到[源仓库](https://github.com/xiyanma/socket-manager)
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
