import io, { Socket } from 'socket.io-client';

interface GenericSocket {
  on: (...args: any[]) => void;
  emit: (...args: any[]) => void;
  close: () => void;
  $$port?: number;
  isWSS?: boolean;
}

// 最大重试次数
const RETRY_COUNT = 10; 
const ERROR_CODE = {
  // 超过最大重试次数
  OVER_RETRY_MAX: -10000, 
};
const SOCKETIO_START_PORT = 1212;
const WEBSOCKET_START_PORT = 1212;

type SocketFactory = (
  createSocketFn: (
    targetPort: number,
    onConnect: () => void,
    onConnectError: (message: string) => void
  ) => GenericSocket,
  startPort: number,
  maxRetry?: number
) => Promise<GenericSocket>;

let SocketManager: {
  init: () => Promise<GenericSocket>;
  _initSocket: () => Promise<GenericSocket>;
  $$port?: number;
  emit?: (name: string, data: any) => void;
  on?: (name: string, cb: (data: any) => void) => void;
  close?: () => void;
  isWSS?: boolean;
  connectSccuessed?: boolean;
};

(() => {
  const socketFactory: SocketFactory = (
    createSocketFn,
    startPort,
    maxRetry = RETRY_COUNT
  ) => {
    let CONNECTED_INSTANCE: GenericSocket | null = null;

    const socketInit = (reTryCount = 0): Promise<GenericSocket> => {
      const createSocket = (): Promise<GenericSocket> => {
        if (reTryCount > maxRetry)
          return Promise.reject(ERROR_CODE.OVER_RETRY_MAX);

        return new Promise((resolve, reject) => {
          const targetPort = startPort + reTryCount;
          console.log(
            `====> 尝试连接socket start by [${startPort}]: ${targetPort}`
          );

          const socket = createSocketFn(
            targetPort,
            () => {
              socket['$$port'] = targetPort;
              CONNECTED_INSTANCE = socket;
              resolve(socket);
            },
            (message: string) => {
              reject(message);
            }
          );
        });
      };

      return createSocket().catch((e) => {
        if (e === ERROR_CODE.OVER_RETRY_MAX) {
          return Promise.reject(ERROR_CODE.OVER_RETRY_MAX);
        }

        if (CONNECTED_INSTANCE) return CONNECTED_INSTANCE;

        return socketInit(reTryCount + 1);
      });
    };

    return socketInit();
  };

  const socketIOInit = () => {
    const createSocketFn = (
      targetPort: number,
      onConnect: () => void,
      onConnectError: (message: string) => void
    ): GenericSocket => {
      const socket: Socket = io(`http://localhost:${targetPort}`, {
        path: '/socket.io',
        forceNew: true,
        reconnectionAttempts: 0,
        timeout: 2000,
      }) as GenericSocket;

      socket.on(
        'connect_error',
        ({
          // type,
          message,
        }) => {
          socket.close();
          onConnectError(message);
        }
      );

      socket.on('connect', () => {
        onConnect();
      });

      return socket;
    };

    return socketFactory(createSocketFn, SOCKETIO_START_PORT, RETRY_COUNT);
  };

  const websocketInit = () => {
    const createSocketFn = (
      targetPort: number,
      onConnect: () => void,
      onConnectError: (message: string) => void
    ): GenericSocket => {
      const socket = new WebSocket(`ws://127.0.0.1:${targetPort}`);

      let isTimeout = false;
      const tt = setTimeout(() => {
        isTimeout = true;
        socket.close();
        onConnectError('timeout');
      }, 2000);

      socket.onopen = () => {
        if (isTimeout) return;

        clearTimeout(tt);

        onConnect();
      };

      socket.onerror = (e: Event) => {
        clearTimeout(tt);

        onConnectError(e.toString());
      };

      return socket;
    };

    return socketFactory(createSocketFn, WEBSOCKET_START_PORT, RETRY_COUNT);
  };

  // 对外的统一模块
  SocketManager = {
    init() {
      console.log('====> SocketManager initing...');
      return this._initSocket()
        .then((res) => {
          console.log('====> SocketManager inited!');
          return res;
        })
        .catch((e) => {
          console.error('====> SocketManager failed!');

          return Promise.reject(e);
        });
    },
    _initSocket() {
      const connectSuccess = (socket: GenericSocket, resolve: (value: GenericSocket) => void) => {
        // 已经成功则勿略
        if (this.connectSccuessed) return; 

        console.log(
          `====> connect ${socket.isWSS ? 'websocket' : 'socketIO'} sccuessed [${
            socket.$$port
          }]`
        );

        this.connectSccuessed = true;

        resolve(socket);
      };

      return new Promise<GenericSocket>((resolve, reject) => {
        let ioRetryEnd = false;
        let webRetryEnd = false;

        const checkRetryEnd = () => {
          if (ioRetryEnd && webRetryEnd) {
            reject();
          }
        };

        socketIOInit()
          .then((socket) => {
            const socketIO = socket as Socket;
            this.$$port = socket.$$port;

            this.emit = (name: string, data: any) => {
              socketIO.emit(name, data);
            };

            this.on = (name: string, cb: (data: any) => void) => {
              socketIO.on(name, (data: any) => {
                try {
                  data.data = JSON.parse(data.data);
                } catch (error) {}

                cb(data);
              });
            };

            this.close = () => {
              socketIO.close();
            };

            connectSuccess(this, resolve);
          })
          .catch((e) => {
            console.error('socketIOInit error', e);

            if (e === ERROR_CODE.OVER_RETRY_MAX) {
              ioRetryEnd = true;
              checkRetryEnd();
            }
          });

        websocketInit()
          .then((socket) => {
            this.$$port = socket.$$port;

            const listeners: { name: string; cb: (data: any) => void }[] = [];
            socket.onmessage = (message: any) => {
              const {
                event,
                ...data
              } = JSON.parse(message.data);

              const matchListeners = listeners.filter(
                (a: any) => a.name === event
              );

              matchListeners.forEach((l: any) => {
                l.cb(data);
              });
            };

            this.emit = (name: string, data: any = {}) => {
              socket.send(
                JSON.stringify({
                  event: name,
                  ...data,
                })
              );
            };

            this.on = (name: string, cb: (data: any) => void) => {
              listeners.push({
                name,
                cb,
              });
            };

            this.close = () => {
              socket.close();
            };

            this.isWSS = true;

            connectSuccess(this, resolve);
          })
          .catch((e) => {
            console.error('websocketInit error', e);

            if (e === ERROR_CODE.OVER_RETRY_MAX) {
              webRetryEnd = true;
              checkRetryEnd();
            }
          });
      });
    },
  };
})();

export default SocketManager;
