const Manager = require('../base/Manager');
const Player = require('../player/Player');
module.exports = class PlayerManager extends Manager {
  constructor()
  {
    super();
  }

  addPlayer()
  {
    const newPlayer = new Player();
    return this._repo.insert(newPlayer);
  }

  getAll()
  {
    return this._repo.getAll();
  }

}