const Request = require('../Request');

module.exports = class RequestValue extends Request {

  constructor()
  {
    super();
    this._value = 0;
  }

  setValue(value)
  {
    this._value = value;
  }
};