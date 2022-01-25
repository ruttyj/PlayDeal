const AutoIncRepo = require('../../base/AutoIncRepo');
const RequestChain = require('./RequestChain');

module.exports = class RequestManager {
  constructor(game)
  {
    this._game = game;
    this._actions = new AutoIncRepo();
    this._actionChains = new AutoIncRepo();
  }

  addRequest(request)
  {
    return this._actions.insert(request);
  }
};