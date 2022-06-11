---
nav:
  title: 使用示例
  order: 2
---

## 使用示例

（客户端）

建立连接

```js
SocketConnect.init()
  .then((_socket) => {
    port = _socket.$$port;
    mySocket = new SocketManager(_socket);

    mySocket.listening({
      port,
    });

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

## socket.io 调试工具

https://amritb.github.io/socketio-client-tool/#eyJsaXN0ZW4iOlsib2siLCJzb2NrZXRpby1jbGllbnQiLCJtZXNzYWdlIiwiYXBpU3VjY2VzcyIsImFwaUZhaWwiXSwiZW1pdCI6WyJhcGkiLCJhcGkiLCJzb2NrZXRpby1jbGllbnQiLCJzb2NrZXRpby1jbGllbnQtYWNrIl0sImNvbmZpZyI6IntcInBhdGhcIjogXCIvc29ja2V0LmlvXCIsIFwiZm9yY2VOZXdcIjogdHJ1ZSwgXCJyZWNvbm5lY3Rpb25BdHRlbXB0c1wiOiAzLCBcInRpbWVvdXRcIjogMjAwMH0ifQ==
