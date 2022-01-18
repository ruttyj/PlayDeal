const Model = require('../base/Model');
const TagContainer = require('./TagContainer');

module.exports = class PropertySet extends Model {

  static AMBIGIOUS_SET = 'ambigious';
  static USELESS_SET = 'useless';
  
  constructor()
  {
    super();
    this._code = 'default';
    this._tags = new TagContainer();
    this._colorCode = null;
    this._rentValues = new Map();
  }

  setCode(code)
  {
    this._code = code;
  }

  getCode()
  {
    return this._code;
  }

  setRentValue(cardCount, value)
  {
    this._rentValues.set(parseInt(cardCount, 10), parseInt(value, 10));
  }

  getRentValue(cardCount)
  {
    if(this._rentValues.has(cardCount)){
      return this._rentValues.get(cardCount);
    }
    return 0;
  }
  
  setColorCode(colorCode)
  {
    this._colorCode = colorCode;
  }

  getColorCode()
  {
    return this._colorCode;
  }
  
  addTags(tags)
  {
    tags.forEach(tag => {
      this._tags.add(tag);
    })
  }

  hasTag(tag)
  {
    return this._tags.has(tag);
  }

  _serialize()
  {
    let parent = super._serialize();
    return {
      ...parent,
      code: this._code,
      colorCode: this._colorCode,
      tags: this._tags.serialize()
    }
  }

  _unserialzie(data)
  {
    super._unserialize(data);
    this._code = data.code;
    this._colorCode = data.colorCode,
    this._tags._unserialize(data.tags);
  }
}