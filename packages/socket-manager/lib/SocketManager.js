'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectSpread2'),
);

var _classCallCheck2 = _interopRequireDefault(
  require('@babel/runtime/helpers/classCallCheck'),
);

var _createClass2 = _interopRequireDefault(
  require('@babel/runtime/helpers/createClass'),
);

var _uuid = require('uuid');

var _util = require('./util');

var SocketManager = /*#__PURE__*/ (function () {
  function SocketManager(socket) {
    (0, _classCallCheck2.default)(this, SocketManager);
    this.socket = void 0;
    this.responseMap = {};
    this.socket = socket;
  }

  (0, _createClass2.default)(SocketManager, [
    {
      key: 'send',
      value: function send(data) {
        var _this = this;

        var reqId = (0, _uuid.v4)();
        var req = new Promise(function (resolve, reject) {
          //如果你想保存返回的data
          if (
            (data === null || data === void 0 ? void 0 : data.type) ===
            'getPrinters'
          ) {
            _this.responseMap[reqId] = {
              resolve: resolve,
              reject: reject,
              data: data,
            };
          } else {
            _this.responseMap[reqId] = {
              resolve: resolve,
              reject: reject,
            };
          }

          _this.socket.emit(
            'api',
            (0, _objectSpread2.default)(
              (0, _objectSpread2.default)({}, data),
              {},
              {
                reqId: reqId,
              },
            ),
          );
        });
        return req;
      }, // 监听结果返回
    },
    {
      key: 'listening',
      value: function listening(data) {
        var _this2 = this;

        /* 通用：对返回结果的处理*/
        this.socket.on('apiSuccess', function (event) {
          try {
            // 请求成功
            var reqId = event.reqId,
              _data = event.data;
            var resolve = _this2.responseMap[reqId].resolve;
            return resolve(_data ? (0, _util.parseJson)(_data) : '');
          } catch (e) {
            // 请求成功-但返回结果失败
            var _reqId = event.reqId,
              _data2 = event.data;
            var reject = _this2.responseMap[_reqId].reject;
            return reject(_data2 ? (0, _util.parseJson)(_data2) : '');
          }
        });
        this.socket.on('apiFail', function (error) {
          var _this2$responseMap$er;

          var reqBody =
            (_this2$responseMap$er =
              _this2.responseMap[
                error === null || error === void 0 ? void 0 : error.reqId
              ]) === null || _this2$responseMap$er === void 0
              ? void 0
              : _this2$responseMap$er.data; //请求失败

          var reqId = error.reqId;
          var reject = _this2.responseMap[reqId].reject;

          try {
            JSON.stringify(error);
            return reject(JSON.stringify(error));
          } catch (_unused) {
            return reject(error);
          }
        });
      },
    },
    {
      key: 'disconnect',
      value: function disconnect() {
        var _this3 = this;

        this.socket.disconnect();
        Object.keys(this.responseMap).forEach(function (reqId) {
          _this3.responseMap[reqId].reject('disconnect');
        });
        this.responseMap = {};
      },
    },
  ]);
  return SocketManager;
})();

var _default = SocketManager;
exports.default = _default;
