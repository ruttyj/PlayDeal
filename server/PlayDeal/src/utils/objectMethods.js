const {
  isObj
} = require('./helperMethods');

/**
 * 
 * @param object|string|int objectOrId
 * @param string getterName 
 * @returns 
 */
const getIdFromObj = function (objectOrId, getterName) {
  let id = null;
  if (isObj(objectOrId)) {
    // if is function execute function
    let isFunction = getterName.slice(-2) === "()";
    if (isFunction) {
      id = objectOrId[getterName.slice(0, -2)]();
    } else {
      // else get prop containing the id
      id = objectOrId[getterName];
    }
  } else {
    id = objectOrId;
  }
  return id;
};


module.exports = {
  getIdFromObj
};