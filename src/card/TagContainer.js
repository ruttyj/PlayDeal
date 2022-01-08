module.exports = class TagContainer {
  constructor()
  {
    this.reset();
  }

  reset()
  {
    this._items = new Map();
  }

  add(tag)
  {
    this._items.set(tag, true);
  }

  has(tag)
  {
    return this._items.has(tag);
  }

  remove(tag)
  {
    this._items.remove(tag);
  }

  serialize()
  {
    const result = [];
    this._items.forEach((junk, tag) => {
      result.push(tag);
    })
    return result;
  }

  unserialize(tags)
  {
    this.reset();
    tags.forEach(tag => {
      this.add(tag);
    })
  }
}