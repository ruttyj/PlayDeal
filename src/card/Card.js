const Model = require('../base/Model');
const TagContainer = require('./TagContainer');
const ComponentContainer = require('./ComponentContainer');

module.exports = class Card extends Model {

  static TYPE_ACTION = 'action';
  static TYPE_CASH = 'cash';
  static TYPE_PROPERTY = 'property';

  static TAG_DRAW = 'draw';
  static TAG_BANKABLE = 'bankable';
  static TAG_REQUEST = 'request';
  static TAG_COLLECT_VALUE = 'collectValue';
  static TAG_CONTESTABLE = 'contestable';
  static TAG_STEAL_COLLECTION = 'stealCollection';
  static TAG_STEAL_PROPERTY = 'stealProperty';
  static TAG_SWAP_PROPERTY = 'swapProperty';
  static TAG_DECLINE_REQUEST = 'declineRequest';
  static TAG_RENT = 'rent';
  static TAG_RENT_AUGMENT = 'rentAugment';
  static TAG_SET_AUGMENT = 'setAugment';
  static TAG_HOUSE = 'house';
  static TAG_HOTEL = 'hotel';
  static TAG_PROPERTY = 'property';
  static TAG_UTILITY = 'utility';
  static TAG_TRANSPORT = 'transport';

  static TARGET_ONE = 'one';
  static TARGET_ALL = 'all';

  static COMP_ACTIVE_SET = 'activeSet';
  static COMP_DRAW_CARD = 'drawCard';
  static COMP_RENT = 'rent';
  static COMP_COLLECT_VALUE = 'collectValue';
  static COMP_COLLECT_VALUE_AUGMENT = 'collectValueAugment';
  static COMP_SET_AUGMENT = 'setAugment';

  constructor()
  {
    super();
    this._type = 'default';
    this._key = null;
    this._value = null;
    this._tags = new TagContainer();
    this._comps = new ComponentContainer();
  }

  setKey(key)
  {
    this._key = key;
  }

  getKey()
  {
    return this._key;
  }

  setType(type)
  {
    this._type = type;
  }

  getType()
  {
    return this._type;
  }


  hasValue()
  {
    return this._value !== null;
  }

  setValue(v)
  {
    this._value = v;
  }

  getValue()
  {
    return this._value;
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

  addComp(key, comp)
  {
    this._comps.add(key, comp);
  }

  hasComp(key)
  {
    return this._comps.has(key);
  }

  getComp(key)
  {
    return this._comps.get(key);
  }

  removeComp(key)
  {
    this._comps.remove(key);
  }

  _serialize()
  {
    let parent = super._serialize();
    return {
      ...parent,
      type: this._type,
      key: this._key,
      value: this._value,
      tags: this._tags.serialize(),
      comps: this._comps.serialize(),
    }
  }

  _unserialzie(data)
  {
    super._unserialize(data);
    this._type = data.type;
    this._key = data.key;
    this._value = data.value;
    this._tags.unserialzie(data.tags);
    this._comps.unserialzie(data.comps);
  }
}