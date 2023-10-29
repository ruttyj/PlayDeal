//==================================================

//                Commonly Reused

//==================================================
const els = (v, el) => (isDef(v) ? v : el);
const elsFn = (v, fn) => (isDef(v) ? v : fn());
const isDef = (v) => v !== undefined && v !== null;
const isArr = (v, len = 0) => isDef(v) && Array.isArray(v) && v.length >= len;
const isFunc = (v) => isDef(v) && typeof v === "function";
const isStr = (v) => isDef(v) && typeof v === "string";
const isNum = (v) => isDef(v) && typeof v === "number";
const isObj = (v) => isDef(v) && typeof v === "object";
const isUndef = (v) => v === undefined || v === null;
const isTrue = (v) => v === true;
const isFalse = (v) => v === false;
const identity = (v) => v;
const emptyFunction = () => {};

module.exports = {
  els,
  elsFn,
  isUndef,
  isDef,
  isStr,
  isNum,
  isObj,
  isArr,
  isFunc,
  isTrue,
  isFalse,
  identity,
  emptyFunction,
}