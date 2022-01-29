const Request = require('../Request');
const WealthTransfer = require('../WealthTransfer');

module.exports = class RequestWealthTransfer extends Request {

  constructor(game)
  {
    super(game);
    this._wealthTransfer = new WealthTransfer();
  }

  getWealthTransfer()
  {
    return this._wealthTransfer;
  }

  serialize()
  {
    return {
      ...super.serialize(),
      transfer: this._wealthTransfer.serialize()
    };
  }
}
