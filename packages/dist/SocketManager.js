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
exports.__esModule = true;
var uuid_1 = require("uuid");
var util_1 = require("./util");
var SocketManager = /** @class */ (function () {
    function SocketManager(socket) {
        this.responseMap = {};
        this.socket = socket;
    }
    SocketManager.prototype.send = function (data) {
        var _this = this;
        var reqId = uuid_1.v4();
        var req = new Promise(function (resolve, reject) {
            //如果你想保存返回的data
            if ((data === null || data === void 0 ? void 0 : data.type) === 'getPrinters') {
                _this.responseMap[reqId] = { resolve: resolve, reject: reject, data: data };
            }
            else {
                _this.responseMap[reqId] = { resolve: resolve, reject: reject };
            }
            _this.socket.emit('api', __assign(__assign({}, data), { reqId: reqId }));
        });
        return req;
    };
    // 监听结果返回
    SocketManager.prototype.listening = function (data) {
        var _this = this;
        /* 通用：对返回结果的处理*/
        this.socket.on('apiSuccess', function (event) {
            try {
                // 请求成功
                var reqId = event.reqId, data_1 = event.data;
                var resolve = _this.responseMap[reqId].resolve;
                return resolve(data_1 ? util_1.parseJson(data_1) : '');
            }
            catch (e) {
                // 请求成功-但返回结果失败
                var reqId = event.reqId, data_2 = event.data;
                var reject = _this.responseMap[reqId].reject;
                return reject(data_2 ? util_1.parseJson(data_2) : '');
            }
        });
        this.socket.on('apiFail', function (error) {
            var _a;
            var reqBody = (_a = _this.responseMap[error === null || error === void 0 ? void 0 : error.reqId]) === null || _a === void 0 ? void 0 : _a.data;
            //请求失败
            var reqId = error.reqId;
            var reject = _this.responseMap[reqId].reject;
            try {
                JSON.stringify(error);
                return reject(JSON.stringify(error));
            }
            catch (_b) {
                return reject(error);
            }
        });
    };
    SocketManager.prototype.disconnect = function () {
        var _this = this;
        this.socket.disconnect();
        Object.keys(this.responseMap).forEach(function (reqId) {
            _this.responseMap[reqId].reject('disconnect');
        });
        this.responseMap = {};
    };
    return SocketManager;
}());
exports["default"] = SocketManager;
