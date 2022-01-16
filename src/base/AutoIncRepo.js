module.exports = class AutoIncRepo {
  constructor()
  {
    this.reset();
  }

  reset()
  {
    this._topId = 0;
    this._items = new Map();
  }

  encode(data)
  {
    //return JSON.stringify(data);
    return data;
  }

  decode(data)
  {
    //return JSON.parse(data);
    return data;
  }

  serialize()
  {
    let result = {
      topId: this._topId,
      items: {},
      order: [],
    };
    for (const [key, model] of this._items.entries()) {
      result.items[key] = model.serialize();
      result.order.push(key);
    }
    return this.encode(result);
  }

  unserialize(str)
  {
    // @TODO
    this.reset();
  }

  _getNewId()
  {
    ++this._topId;
    return this._topId;
  }

  insert(model)
  {
    let id = this._getNewId();
    model.setId(id);
    this.update(id,  model);

    return this.get(id);
  }

  update(key,  model)
  {
    this._items.set(key,  model);
  }

  get(key)
  {
    return this._items.get(key);
  }

  getAll()
  {
    let result = [];
    for (const [key, model] of this._items.entries()) {
      result.push(model);
    }
    return result;
  }

  getAllKeys()
  {
    let result = [];
    for (const [key, model] of this._items.entries()) {
      result.push(key);
    }
    return result;
  }

  has(key)
  {
    return this._items.has(key);
  }

  delete(key)
  {
    this._items.delete(key);
  }

  count()
  {
    return this._items.size;
  }
}