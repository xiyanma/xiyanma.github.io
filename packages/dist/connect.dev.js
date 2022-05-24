"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _socket = _interopRequireDefault(require("socket.io-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var SocketConnect;

(function () {
  // socket.io 的初始化
  var RETRY_COUNT = 10; // 最大重试次数

  var ERROR_CODE = {
    OVER_RETRY_MAX: -10000 // 超过最大重试次数

  };
  var SOCKETIO_START_PORT = 1212;
  var WEBSOCKET_START_PORT = 1212;

  var socketFactory = function socketFactory(createSocketFn, startPort) {
    var maxRetry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;
    var CONNECTED_INSTANCE; // 已连接的实例

    var socketInit = function socketInit() {
      var reTryCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var createSocket = function createSocket() {
        if (reTryCount > maxRetry) return Promise.reject(ERROR_CODE.OVER_RETRY_MAX);
        return new Promise(function (resolve, reject) {
          var targetPort = startPort + reTryCount;
          console.log("====> \u5C1D\u8BD5\u8FDE\u63A5socket start by [".concat(startPort, "]: ").concat(targetPort));
          var socket = createSocketFn(targetPort, function () {
            CONNECTED_INSTANCE = socket;
            resolve(socket);
          }, function (message) {
            // typeof socket.close === 'function' && socket.close();
            reject(message);
          });
        });
      };

      return createSocket()["catch"](function (e) {
        if (e === ERROR_CODE.OVER_RETRY_MAX) {
          return Promise.reject(ERROR_CODE.OVER_RETRY_MAX);
        }

        if (CONNECTED_INSTANCE) return CONNECTED_INSTANCE;
        return socketInit(reTryCount + 1);
      });
    };

    return socketInit;
  };

  var socketIOInit = function socketIOInit() {
    var createSocketFn = function createSocketFn(targetPort, onConnect, onConnectError) {
      var socket = (0, _socket["default"])("http://localhost:".concat(targetPort), {
        "path": "/socket.io",
        "forceNew": true,
        "reconnectionAttempts": 0,
        "timeout": 2000
      });
      socket.io.on("error", function (_ref) {
        var type = _ref.type,
            message = _ref.message;
        socket.close();
        onConnectError(message);
      });
      socket.on("connect", function () {
        onConnect();
      });
      return socket;
    };

    return socketFactory(createSocketFn, SOCKETIO_START_PORT, RETRY_COUNT)();
  };

  var websocketInit = function websocketInit() {
    var createSocketFn = function createSocketFn(targetPort, onConnect, onConnectError) {
      var socket = new WebSocket("ws://127.0.0.1:".concat(targetPort));
      var isTimeout = false;
      var tt = setTimeout(function () {
        isTimeout = true;
        socket.close();
        onConnectError('timeout');
      }, 2000);

      socket.onopen = function () {
        if (isTimeout) return;
        clearTimeout(tt);
        onConnect();
      };

      socket.onerror = function () {
        var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        clearTimeout(tt);
        onConnectError(e.message || e);
      };

      return socket;
    };

    return socketFactory(createSocketFn, WEBSOCKET_START_PORT, RETRY_COUNT)();
  }; // 对外的统一模块


  SocketConnect = {
    init: function init() {
      console.log('====> SocketConnect initing...');
      return this._initSocket().then(function (res) {
        console.log('====> SocketConnect inited!');
        return res;
      })["catch"](function (e) {
        console.error('====> SocketConnect failed!');
        return Promise.reject(e);
      });
    },
    _initSocket: function _initSocket() {
      var _this = this;

      // socketIOInit()
      var connectSccuess = function connectSccuess(socket, resolve) {
        if (_this.connectSccuessed) return; // 已经成功则勿略

        console.log('====> connect sccuessed');
        _this.connectSccuessed = true;
        resolve(socket);
      };

      return new Promise(function (resolve, reject) {
        var ioRetryEnd = false;
        var webRetryEnd = false;

        var checkReTryEnd = function checkReTryEnd() {
          if (ioRetryEnd && webRetryEnd) {
            reject();
          }
        }; // 启动 socketIO


        socketIOInit().then(function (socket) {
          _this.emit = function (name, data) {
            socket.emit(name, data);
          };

          _this.on = function (name, cb) {
            socket.on(name, function (data) {
              try {
                data.data = JSON.parse(data.data);
              } catch (error) {}

              cb(data);
            });
          };

          connectSccuess(_this, resolve);
        })["catch"](function (e) {
          console.error('socketIOInit error', e);

          if (e === ERROR_CODE.OVER_RETRY_MAX) {
            ioRetryEnd = true;
            checkReTryEnd();
          }
        }); // 启动 websocket

        websocketInit().then(function (socket) {
          var listeners = [];

          socket.onmessage = function (message) {
            var _JSON$parse = JSON.parse(message.data),
                event = _JSON$parse.event,
                data = _objectWithoutProperties(_JSON$parse, ["event"]);

            var matchListeners = listeners.filter(function (a) {
              return a.name === event;
            });
            matchListeners.forEach(function (l) {
              l.cb(data);
            });
          };

          _this.emit = function (name) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            // data = typeof data === 'object' ? JSON.stringify(data) : data;
            socket.send(JSON.stringify(_objectSpread({
              event: name
            }, data)));
          };

          _this.on = function (name, cb) {
            listeners.push({
              name: name,
              cb: cb
            });
          };

          _this.isWSS = true;
          connectSccuess(_this, resolve);
        })["catch"](function (e) {
          console.error('websocketInit error', e);

          if (e === ERROR_CODE.OVER_RETRY_MAX) {
            webRetryEnd = true;
            checkReTryEnd();
          }
        });
      });
    } // send(...args) {
    // },
    // on(...args) {
    // },

  };
})(); // window.SocketConnect = SocketConnect;


var _default = SocketConnect;
exports["default"] = _default;