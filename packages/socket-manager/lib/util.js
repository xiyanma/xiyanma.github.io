'use strict';

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.parseJson = parseJson;

var _typeof2 = _interopRequireDefault(require('@babel/runtime/helpers/typeof'));

/**
 *
 * @export 解析json
 * @param {string} str
 * @return {*}
 */
function parseJson(str) {
  if ((0, _typeof2.default)(str) === 'object') {
    return str;
  }

  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    console.log(e); // aegis.report(new Error(`pageJson解析错误：${e} 解析的json：${str}`));

    return str;
  }
}
