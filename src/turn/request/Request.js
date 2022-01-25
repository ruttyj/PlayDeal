const Model = require('../../base/Model');

module.exports = class Request extends Model {

  constructor()
  {
    super();
    this._type = null;
    this._target = null;
    this._author = null;    
  }

  setType(type)
  {
    this._type = type;
  }

  setTarget(target)
  {
    this._target = target;
  }

  setAuthor(author)
  {
    this._author = author;
  }

};