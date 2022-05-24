"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var socket_io_client_1 = require("socket.io-client");
var SocketManager;
(function () {
    // socket.io 的初始化
    var RETRY_COUNT = 10; // 最大重试次数
    var ERROR_CODE = {
        OVER_RETRY_MAX: -10000
    };
    var SOCKETIO_START_PORT = 1212;
    var WEBSOCKET_START_PORT = 1212;
    var socketFactory = function (createSocketFn, startPort, maxRetry) {
        if (maxRetry === void 0) { maxRetry = 20; }
        var CONNECTED_INSTANCE; // 已连接的实例
        var socketInit = function (reTryCount) {
            if (reTryCount === void 0) { reTryCount = 0; }
            var createSocket = function () {
                if (reTryCount > maxRetry)
                    return Promise.reject(ERROR_CODE.OVER_RETRY_MAX);
                return new Promise(function (resolve, reject) {
                    var targetPort = startPort + reTryCount;
                    console.log("====> \u5C1D\u8BD5\u8FDE\u63A5socket start by [" + startPort + "]: " + targetPort);
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
                if (CONNECTED_INSTANCE)
                    return CONNECTED_INSTANCE;
                return socketInit(reTryCount + 1);
            });
        };
        return socketInit;
    };
    var socketIOInit = function () {
        var createSocketFn = function (targetPort, onConnect, onConnectError) {
            var socket = socket_io_client_1["default"]("http://localhost:" + targetPort, {
                "path": "/socket.io",
                "forceNew": true,
                "reconnectionAttempts": 0,
                "timeout": 2000
            });
            socket.io.on("error", function (_a) {
                var type = _a.type, message = _a.message;
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
    var websocketInit = function () {
        var createSocketFn = function (targetPort, onConnect, onConnectError) {
            var socket = new WebSocket("ws://127.0.0.1:" + targetPort);
            var isTimeout = false;
            var tt = setTimeout(function () {
                isTimeout = true;
                socket.close();
                onConnectError('timeout');
            }, 2000);
            socket.onopen = function () {
                if (isTimeout)
                    return;
                clearTimeout(tt);
                onConnect();
            };
            socket.onerror = function (e) {
                if (e === void 0) { e = {}; }
                clearTimeout(tt);
                onConnectError(e.message || e);
            };
            return socket;
        };
        return socketFactory(createSocketFn, WEBSOCKET_START_PORT, RETRY_COUNT)();
    };
    // 对外的统一模块
    SocketManager = {
        init: function () {
            console.log('====> SocketManager initing...');
            return this._initSocket()
                .then(function (res) {
                console.log('====> SocketManager inited!');
                return res;
            })["catch"](function (e) {
                console.error('====> SocketManager failed!');
                return Promise.reject(e);
            });
        },
        _initSocket: function () {
            var _this = this;
            // socketIOInit()
            var connectSccuess = (function (socket, resolve) {
                if (_this.connectSccuessed)
                    return; // 已经成功则勿略
                console.log('====> connect sccuessed');
                _this.connectSccuessed = true;
                resolve(socket);
            });
            return new Promise(function (resolve, reject) {
                var ioRetryEnd = false;
                var webRetryEnd = false;
                var checkReTryEnd = function () {
                    if (ioRetryEnd && webRetryEnd) {
                        reject();
                    }
                };
                // 启动 socketIO
                socketIOInit()
                    .then(function (socket) {
                    _this.emit = function (name, data) {
                        socket.emit(name, data);
                    };
                    _this.on = function (name, cb) {
                        socket.on(name, function (data) {
                            try {
                                data.data = JSON.parse(data.data);
                            }
                            catch (error) { }
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
                });
                // 启动 websocket
                websocketInit()
                    .then(function (socket) {
                    var listeners = [];
                    socket.onmessage = function (message) {
                        var _a = JSON.parse(message.data), event = _a.event, // : 'apiSuccess',
                        data = __rest(_a, ["event"]);
                        var matchListeners = listeners.filter(function (a) { return a.name === event; });
                        matchListeners.forEach(function (l) {
                            l.cb(data);
                        });
                    };
                    _this.emit = function (name, data) {
                        if (data === void 0) { data = {}; }
                        // data = typeof data === 'object' ? JSON.stringify(data) : data;
                        socket.send(JSON.stringify(__assign({ event: name }, data)));
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
        }
    };
})();
// window.SocketManager = SocketManager;
exports["default"] = SocketManager;
