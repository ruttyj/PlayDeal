const AutoIncRepo = require('../../base/AutoIncRepo');
const RequestChain = require('./RequestChain');
const Request = require('./Request');

module.exports = class RequestManager {
  constructor(game)
  {
    this._game = game;
    this._actionChains = new AutoIncRepo();
  }

  _createActionChain()
  {
    
  }
};