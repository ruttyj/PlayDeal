const Request = require('../Request');
const RequestWealthTransfer = require('./RequestWealthTransfer');

module.exports = class RequestValue extends RequestWealthTransfer {

  constructor(game)
  {
    super(game);
    this._type = Request.TYPE_REQUEST_VALUE;
    this._value = 0;
  }

  setValue(value)
  {
    this._value = value;
  }

  getValue()
  {
    return this._value;
  }

  accept()
  {
    super.accept();
  }

  decline()
  {
    super.decline();
  }

  serialize()
  {
    return {
      ...super.serialize(),
      value: this._value
    };
  }
};