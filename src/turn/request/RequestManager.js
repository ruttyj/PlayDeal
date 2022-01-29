const AutoIncRepo = require('../../base/AutoIncRepo');

module.exports = class RequestManager {
  constructor(game)
  {
    this._game = game;
    this._requests = new AutoIncRepo();
  }

  addRequest(request)
  {
    return this._requests.insert(request);
  }

  filterRequests(fn)
  {
    const result = [];
    this._requests.forEach(request => {
      if(fn(request)) {
        result.push(request); 
      }
    });

    return result;
  }

  getRequest(requestId)
  {
    return this._requests.get(requestId);
  }

  getRequestsByPlayerId(playerId)
  {
    return this.filterRequests((request) => request.getAuthorId() === playerId);
  }

  getRequestTargetedAtPlayerId(playerId)
  {
    return this.filterRequests((request) => request.getTargetId() === playerId);
  }

  serialize()
  {
    return {
      requests: this._requests.getAll().map(request => request.serialize()),
    };
  }
};