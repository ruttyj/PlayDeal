module.exports = class ComponentContainer
{
  constructor()
  {
    this.reset();
  }

  reset()
  {
    this._items = new Map();
  }

  add(key, comp)
  {
    this._items.set(key, comp);
  }

  has(key)
  {
    return this._items.has(key);
  }


  get(key)
  {
    return this._items.get(key);
  }

  remove(key)
  {
    this._items.remove(key);
  }

  serialize()
  {
    const result = {}
    this._items.forEach((value, key) => {
      result[key] = value;
    })
    return result;
  }

  unserialzie(data)
  {
    this.reset();
    if(data){
      Object.keys(data).forEach(key => {
        let value = data[key];
        this.add(key, value);
      })
    }
  }
}