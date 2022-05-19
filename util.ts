/**
 *
 * @export 解析json
 * @param {string} str
 * @return {*}
 */
export function parseJson(str: string) {
  if (typeof str === 'object') {
    return str;
  }

  try {
    const obj = JSON.parse(str);

    return obj;
  } catch (e) {
    console.log(e);
    // aegis.report(new Error(`pageJson解析错误：${e} 解析的json：${str}`));
    return str;
  }
}
