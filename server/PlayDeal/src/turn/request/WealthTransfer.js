const Transfer = require('./Transfer');

module.exports = class WealthTransfer {
  
  static DIRECTION_AUTHOR = 'directionAuthor';
  static DIRECTION_TARGET = 'directionTarget';
  
  constructor()
  {
    this._transfers = new Map();
  }

  addTransferDirection(direction)
  {
    if(!this._transfers.has(direction)) {
      this._transfers.set(direction, new Transfer());
    }

    return this.getTransferDirection(direction);
  }

  getTransferDirection(direction)
  {
    return this._transfers.get(direction);
  }

  serialize()
  {
    const transfers = {};
    this._transfers.forEach((transfer, direction) => {
      transfers[direction] = transfer.serialize();
    })

    return {
      direction: transfers,
    };
  }
}
