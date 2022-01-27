const Request = require('../Request');
const Card = require('../../../card/Card');

module.exports = class RequestValue extends Request {

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

  accept()
  {
    Super().accept();
  }

  decline()
  {
    Super().decline();
  }

  serialize()
  {
    return {
      ...super.serialize(),
      value: this._value
    };
  }
};