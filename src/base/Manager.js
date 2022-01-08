const Repository = require('./Repository');

module.exports = class Manager {
  constructor()
  {
    this._repo = new Repository();
  }

  setup()
  {
    //nope
  }

  getCount()
  {
    return this._repo.count();
  }

  encode(data)
  {
    return data;
  }

  decode(data)
  {
    return data;
  }

  serialize()
  {
    return {
      data: this._repo.serialize(),
    };
  }

  unserialize(encoded)
  {
    const decoded = this.decode(encoded);
    this._repo.unserialize(decoded.data);
  }
}