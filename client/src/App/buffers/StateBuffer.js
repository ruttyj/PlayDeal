import debounce from "lodash.debounce";

import {
  isDef,
  isArr,
  isObj,
  isFunc,
  getNestedValue,
  setImmutableValue,
} from "../../utils/";

//#######################################################

//                     STATE BUFFER

//#######################################################
export default function StateBuffer(_initialState = {}) {
  const initialState = _initialState;
  let mCurrentState = initialState;

  let mSetter = null;
  let mMutator = (v) => v;
  const _flush = debounce(async function() {
    flush(mSetter);
  }, 50);

  function setSetter(f) {
    mSetter = f;
  }
  function setMutator(m) {
    mMutator = m;
  }

  function toggle(path = [], fallback = false) {
    let currentValue = get(path, fallback);
    mCurrentState = setImmutableValue(mCurrentState, path, !currentValue);
    _flush();
  }

  function inc(path = [], value = 1) {
    mCurrentState = setImmutableValue(
      mCurrentState,
      path,
      parseFloat(get(path, 0)) + value
    );
    _flush();
  }

  function dec(path = [], value = 1) {
    mCurrentState = setImmutableValue(
      mCurrentState,
      path,
      parseFloat(get(path, 0)) - value
    );
    _flush();
  }

  function forEach(path = [], fn = identity) {
    let iterable = getNestedValue(mCurrentState, path, []);
    if (isDef(iterable)) {
      if (isArr(iterable) || isFunc(iterable.map)) {
        iterable.forEach(fn);
      } else if (isFunc(iterable.forEach)) {
        iterable.forEach((item, key, whole) => {
          fn(item, key, whole);
        });
      } else if (isObj(iterable)) {
        let keys = Object.keys(iterable);
        if (keys.length > 0) {
          return keys.map((key) => {
            let value = iterable[key];
            fn(value, key, iterable);
          });
        }
      }
    }
  }

  function is(A, B = undefined, C = undefined) {
    let path, op, value;

    if (isDef(A) && !isDef(B) && !isDef(C)) {
      path = A;
      op = "===";
      value = true;
    } else {
      if (isDef(A) && isDef(B) && !isDef(C)) {
        path = A;
        op = "===";
        value = B;
      } else if (isDef(A) && isDef(B) && isDef(C)) {
        path = A;
        op = B;
        value = C;
      }
    }

    let nestedVal = get(path);
    switch (op) {
      case "===":
        return nestedVal === value;
      default:
        return nestedVal === op;
    }
  }

  function map(path = [], fn = identity) {
    let result = [];
    forEach(path, (...props) => {
      result.push(fn(...props));
    });
    return result;
  }

  function set(path = [], value) {
    mCurrentState = setImmutableValue(mCurrentState, path, value);
    _flush();
  }

  function flush(_dispatch) {
    if (isDef(mSetter)) {
      mSetter(mMutator(mCurrentState));
    }
  }

  function getState() {
    return mCurrentState;
  }

  function get(path = [], fallback) {
    return getNestedValue(mCurrentState, path, fallback);
  }

  const publicScope = {
    is,
    inc,
    dec,
    get,
    set,
    map,
    forEach,
    toggle,
    flush,
    getState,
    setSetter,
    setMutator,
  };

  function getPublic() {
    return publicScope;
  }

  return getPublic();
}
