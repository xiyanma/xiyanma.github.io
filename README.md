# socket-manager
Socket请求响应处理模块。

构造函数 SocketManager 模仿浏览器的 XMLHttpRequest 对象，内部集成发送请求、监听事件(success，error，timeout)、断开连接、中止响应等方法。管理实例内部消息列表，实现请求消息和响应消息一一对应，以及异常处理，响应结果处理等功能。解决了 WebSocket 并发消息时响应结果难以追踪的问题。

优势：封装独立的 Socket 管理实例。可以在 Socket 通信业务代码中方便地使用。

## Getting Started

Install dependencies,

```bash
$ npm i
```

Start the dev server,

```bash
$ npm start
```

Build site app,

```bash
$ npm run build
```

## 依赖的协议
 如果你想使用SocketManager管理消息，通信需要遵守以下私有协议，以发消息为例，监听消息同理。

 客户端发消息

 ```ts
socket.send('api', {
        // "type": "", 可以自定义哦
        // "mod": "", 
        // "args": { }
    })
 ```

 服务端发消息

表示成功的消息

 ```ts
io.emit('apiSuccess', {
  
})
 ```

表示失败的消息

 ```ts
io.emit('apiFail', {
  
})
 ```

## 使用示例（客户端）

建立连接

```js
SocketConnect.init()
    .then((_socket) => {
      this.socket = _socket

      this.setState({
        isWSS: !!_socket.isWSS,
        // connectState: ACTION_STATE.SUCCESS,
      }, () => {
        this.init();
      })
    })
    .catch((e) => {
      this.setState({
        connectState: ACTION_STATE.FAIL,
      })
    });
```

 挂载实例，管理Socket消息

```ts
import SocketManager from './SocketManager';
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
mySocket.send(data).then(()=>{

})
.catch(()=>{

})
.finally()
```

### 业务侧功能示例及协议展示，以打印服务为例

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

## socket.io服务端调试工具

https://amritb.github.io/socketio-client-tool/#eyJsaXN0ZW4iOlsib2siLCJzb2NrZXRpby1jbGllbnQiLCJtZXNzYWdlIiwiYXBpU3VjY2VzcyIsImFwaUZhaWwiXSwiZW1pdCI6WyJhcGkiLCJhcGkiLCJzb2NrZXRpby1jbGllbnQiLCJzb2NrZXRpby1jbGllbnQtYWNrIl0sImNvbmZpZyI6IntcInBhdGhcIjogXCIvc29ja2V0LmlvXCIsIFwiZm9yY2VOZXdcIjogdHJ1ZSwgXCJyZWNvbm5lY3Rpb25BdHRlbXB0c1wiOiAzLCBcInRpbWVvdXRcIjogMjAwMH0ifQ==

### 关于贡献代码

1. 先 fork [源仓库](https://github.com/xiyanma/socket-manager)到自己的 github 上
2. clone 自己的项目后，更新方法、组件
3. 提交到 github 后提 pr 到[源仓库](https://github.com/xiyanma/socket-manager)
4. 分配其他人 review 和合代码
5. 去源仓库`lerna run publish`发布到 npm

#### 测试用例

1. 原则上是逻辑计算类的公共方法都需要写测试用例
