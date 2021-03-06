---
nav:
  title: 快速上手
  order: 1
---

## 快速上手

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
