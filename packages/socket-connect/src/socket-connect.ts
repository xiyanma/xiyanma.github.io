import io from 'socket.io-client';

let SocketManager: any;

(() => {
  // socket.io 的初始化
  const RETRY_COUNT = 10; // 最大重试次数
  const ERROR_CODE = {
    OVER_RETRY_MAX: -10000, // 超过最大重试次数
  };
  const SOCKETIO_START_PORT = 1212;
  const WEBSOCKET_START_PORT = 1212;

  const socketFactory = (
    createSocketFn: any,
    startPort: any,
    maxRetry = 20,
  ) => {
    let CONNECTED_INSTANCE: any; // 已连接的实例

    const socketInit: any = (reTryCount = 0) => {
      const createSocket = () => {
        if (reTryCount > maxRetry)
          return Promise.reject(ERROR_CODE.OVER_RETRY_MAX);

        return new Promise((resolve, reject) => {
          const targetPort = startPort + reTryCount;
          console.log(
            `====> 尝试连接socket start by [${startPort}]: ${targetPort}`,
          );

          const socket = createSocketFn(
            targetPort,
            () => {
              socket.$$port = targetPort;
              CONNECTED_INSTANCE = socket;
              resolve(socket);
            },
            (message: any) => {
              // typeof socket.close === 'function' && socket.close();

              reject(message);
            },
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

    return socketInit;
  };

  const socketIOInit = () => {
    const createSocketFn = (
      targetPort: any,
      onConnect: any,
      onConnectError: any,
    ) => {
      const socket = io(`http://localhost:${targetPort}`, {
        path: '/socket.io',
        forceNew: true,
        reconnectionAttempts: 0,
        timeout: 2000,
      });

      socket.io.on(
        'error',
        ({
          // type,
          message,
        }) => {
          socket.close();
          onConnectError(message);
        },
      );

      socket.on('connect', () => {
        onConnect();
      });

      return socket;
    };

    return socketFactory(createSocketFn, SOCKETIO_START_PORT, RETRY_COUNT)();
  };

  const websocketInit = () => {
    const createSocketFn = (
      targetPort: any,
      onConnect: any,
      onConnectError: any,
    ) => {
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

      socket.onerror = (e: any = {}) => {
        clearTimeout(tt);

        onConnectError(e.message || e);
      };

      return socket;
    };

    return socketFactory(createSocketFn, WEBSOCKET_START_PORT, RETRY_COUNT)();
  };

  // 对外的统一模块
  SocketManager = {
    init() {
      console.log('====> SocketManager initing...');
      return this._initSocket()
        .then((res: any) => {
          console.log('====> SocketManager inited!');
          return res;
        })
        .catch((e: any) => {
          console.error('====> SocketManager failed!');

          return Promise.reject(e);
        });
    },
    _initSocket() {
      // socketIOInit()
      const connectSccuess = (socket: any, resolve: any) => {
        if (this.connectSccuessed) return; // 已经成功则勿略

        console.log(
          `====> connect ${
            socket.isWSS ? 'websocket' : 'socketIO'
          } sccuessed [${socket.$$port}]`,
        );

        this.connectSccuessed = true;

        resolve(socket);
      };

      return new Promise((resolve, reject) => {
        let ioRetryEnd = false;
        let webRetryEnd = false;

        const checkReTryEnd = () => {
          if (ioRetryEnd && webRetryEnd) {
            reject();
          }
        };

        // 启动 socketIO
        socketIOInit()
          .then((socket: any) => {
            this.$$port = socket.$$port;

            this.emit = (name: any, data: any) => {
              socket.emit(name, data);
            };

            this.on = (name: any, cb: any) => {
              socket.on(name, (data: any) => {
                try {
                  data.data = JSON.parse(data.data);
                } catch (error) {}

                cb(data);
              });
            };

            this.close = () => {
              socket.close();
            };

            connectSccuess(this, resolve);
          })
          .catch((e: any) => {
            console.error('socketIOInit error', e);

            if (e === ERROR_CODE.OVER_RETRY_MAX) {
              ioRetryEnd = true;
              checkReTryEnd();
            }
          });

        // 启动 websocket
        websocketInit()
          .then((socket: any) => {
            this.$$port = socket.$$port;

            const listeners: any = [];
            socket.onmessage = (message: any) => {
              const {
                event, // : 'apiSuccess',
                ...data
              } = JSON.parse(message.data);

              const matchListeners = listeners.filter(
                (a: any) => a.name === event,
              );

              matchListeners.forEach((l: any) => {
                l.cb(data);
              });
            };

            this.emit = (name: any, data = {}) => {
              // data = typeof data === 'object' ? JSON.stringify(data) : data;
              socket.send(
                JSON.stringify({
                  event: name,
                  ...data,
                }),
              );
            };

            this.on = (name: any, cb: any) => {
              listeners.push({
                name,
                cb,
              });
            };

            this.close = () => {
              socket.close();
            };

            this.isWSS = true;

            connectSccuess(this, resolve);
          })
          .catch((e: any) => {
            console.error('websocketInit error', e);

            if (e === ERROR_CODE.OVER_RETRY_MAX) {
              webRetryEnd = true;
              checkReTryEnd();
            }
          });
      });
    },
    // send(...args) {

    // },
    // on(...args) {

    // },
  };
})();

// window.SocketManager = SocketManager;
export default SocketManager;
