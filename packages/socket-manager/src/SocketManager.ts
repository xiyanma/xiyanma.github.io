import { v4 as uuid } from 'uuid';
import { parseJson } from './util';

interface ResponseMapEntry {
  resolve: (value: unknown) => void;
  reject: (value: unknown | string) => void;
  data?: Record<string, any>;
}

interface ApiEvent {
  reqId: string;
  data: string;
}

interface ApiFailure {
  reqId: string;
}

class Socket {
  emit(event: string, request: Record<string, any>): void;
  on(event: string, f: Function): void;
  disconnect(): void;
}

class SocketManager {
  socket: Socket;
  responseMap: Record<string, ResponseMapEntry> = {};

  constructor(socket: Socket) {
    this.socket = socket;
  }

  send(data: Record<string, any>): Promise<unknown> {
    const reqId = uuid();
    const req = new Promise<unknown>((resolve, reject) => {
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

  listening(): void {
    this.socket.on('apiSuccess', (event: ApiEvent) => {
      try {
        const { reqId, data } = event;
        const { resolve } = this.responseMap[reqId];
        return resolve(data ? parseJson(data) : '');
      } catch (e) {
        const { reqId, data } = event;
        const { reject } = this.responseMap[reqId];
        return reject(data ? parseJson(data) : '');
      }
    });

    this.socket.on('apiFail', (error: ApiFailure) => {
      const reqBody = this.responseMap[error?.reqId]?.data;
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

  disconnect(): void {
    this.socket.disconnect();
    Object.keys(this.responseMap).forEach((reqId) => {
      this.responseMap[reqId].reject('disconnect');
    });
    this.responseMap = {};
  }
}

export default SocketManager;
