const Model = require('../../base/Model');

module.exports = class Request extends Model {

  static TYPE_REQUEST_VALUE = 'requestValue';

  static STATUS_REQUESTING = 'requesting';
  static STATUS_CONTESTED = 'contested';
  static STATUS_ACCEPTED = 'accepted';
  static STATUS_DECLINED = 'declined';
  
  constructor(game)
  {
    super();
    this._game = game;
    this._parent = null;
    this._type = null; // type of request
    this._target = null; // person being targeted
    this._author = null; // person making request
    this._cardIds = []; // cards used to trigger request
    this._contestable = false;

    this._status = Request.STATUS_REQUESTING;
    this._isSatisfied = false; // target has satisfied the request - parties may claim their rewards
    this._isClosed = false; // is completly over and done with
  }

  setIsContestable(contestable)
  {
    this._contestable = contestable;
  }

  isContestable()
  {
    return this._contestable;
  }

  setStatus(status)
  {
    this._status = status;
  }

  getStatus()
  {
    return this._status;
  }

  setType(type)
  {
    this._type = type;
  }

  getType()
  {
    return this._type;
  }

  setTargetId(target)
  {
    this._target = target;
  }

  getTargetId()
  {
    return this._target;
  }

  setAuthorId(author)
  {
    this._author = author;
  }

  getAuthorId()
  {
    return this._author;
  }

  setIsSatisfied(isSatisfied)
  {
    this._isSatisfied = isSatisfied;
  }

  isSatisfied()
  {
    return this._isSatisfied;
  }

  setClosed(isClosed)
  {
    this._isClosed = isClosed;
  }

  isClosed()
  {
    return this._isClosed;
  }

  setCardIds(ids)
  {
    this._cardIds = ids;
  }

  accept()
  {
    this._isSatisfied = true;
    this.setStatus(Request.STATUS_ACCEPTED);
  }

  decline()
  {
    this._isSatisfied = true;
    this.setStatus(Request.STATUS_DECLINED);
  }

  serialize()
  {
    return {
      ...super.serialize(),
      type: this._type,
      cardIds: this._cardIds,
      target: this._target,
      author: this._author,
      contestable: this._contestable,

      status: this._status,
      isSatisfied: this._isSatisfied,
      isClosed: this._isClosed,
    }
  }
};