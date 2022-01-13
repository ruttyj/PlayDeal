const Player = require('../player/Player');
const AutoIncRamRepository = require('../base/AutoIncRamRepository');
const CardContainer = require('../card/CardContainer')

module.exports = class PlayerManager {
  constructor()
  {
    this._players = new AutoIncRamRepository();
    this._playerCollections = new AutoIncRamRepository();
    this._playerHands = new Map();
    this._playerBanks = new Map();
  }

  setup()
  {
    //nope
  }

  getPlayerCount()
  {
    return this._players.count();
  }

  addPlayer()
  {
    const newPlayer = new Player();
    const playerModel = this._players.insert(newPlayer);
    const playerId = playerModel.getId();
    this._playerHands.set(playerId, new CardContainer());
    this._playerBanks.set(playerId, new CardContainer());
    
    return playerModel;
  }

  getPlayer(playerId)
  {
    return this._players.get(playerId);
  }

  getPlayerHand(playerId)
  {
    return this._playerHands.get(playerId);
  }

  removePlayer()
  {
    //@TODO
  }

  hasPlayer(playerId)
  {
    return this._players.has(playerId);
  }

  serialize()
  {
    return {
      players: this._players.serialize(),
    };
  }

  unserialize(data)
  {
    this._players.unserialize(data.players);
  }

}
