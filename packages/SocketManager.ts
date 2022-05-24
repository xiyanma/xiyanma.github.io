import { v4 as uuid } from 'uuid';
import { parseJson } from './util';

class SocketManager {
  socket;
  responseMap: {
    [key: string]: {
      resolve: (value: unknown) => void;
      reject: (value: unknown) => void;
      data?: any;
    };
  } = {};

  constructor(socket: any) {
    this.socket = socket;
  }

  send(data: any) {
    const reqId = uuid();
    const req = new Promise((resolve, reject) => {
      if (data?.type === 'getPrinters') {
        this.responseMap[reqId] = { resolve, reject, data };
      } else {
        this.responseMap[reqId] = { resolve, reject };
      }
      this.socket.emit('api', {
        ...data,
        reqId,
      });
    });
    return req;
  }

  // 监听结果返回
  listening(data: { port: any }) {
    const { port } = data;
    /* 通用：对返回结果的处理*/
    this.socket.on('apiSuccess', (event: any) => {
      try {
        // 请求成功
        const { reqId, data } = event;
        const { resolve } = this.responseMap[reqId];
        return resolve(data ? parseJson(data) : '');
      } catch (e) {
        // 请求成功-但返回结果失败
        const { reqId, data } = event;
        const { reject } = this.responseMap[reqId];
        return reject(data ? parseJson(data) : '');
      }
    });

    this.socket.on('apiFail', (error: any) => {
      this.socket.disconnect();
      const reqBody = this.responseMap[error?.reqId]?.data;
      //请求失败
      const { reqId } = error;
      const { reject } = this.responseMap[reqId];
      try {
        JSON.stringify(error);
        return reject(JSON.stringify(error));
      } catch {
        return reject(error);
      }
    });
  }

  disconnect() {
    this.socket.disconnect();
    Object.keys(this.responseMap).forEach((reqId) => {
      this.responseMap[reqId].reject('disconnect');
    });
    this.responseMap = {};
  }
}

export default SocketManager;
