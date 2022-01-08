module.exports = class Model {
  constructor()
  {
    this._id = null;
  }

  setId(id)
  {
    this._id  = id;
  }

  getId()
  {
    return this._id;
  }

  encode(data)
  {
    return data;
  }

  decode(data)
  {
    return data;
  }

  _serialize()
  {
    return {
      id: this._id,
    };
  }

  serialize()
  {
    return this.encode(this._serialize())
  }

  _unserialize(data)
  {
    this._id = data.id;

    return data;
  }

  unserialize(encoded)
  {
    const data = this.decode(encoded);
    this._unserialize(data);
  }
}