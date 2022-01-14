const Player = require('../player/Player');
const AutoIncRepo = require('../base/AutoIncRepo');
const Repo = require('../base/Repo');
const CardContainer = require('../card/CardContainer');
const Collection = require('../card/Collection');

module.exports = class PlayerManager {
  constructor(cardManager)
  {
    this._players = new AutoIncRepo();
    this._playerCollections = new AutoIncRepo();
    this._playerHands = new Repo();
    this._playerBanks = new Repo();
    this._cardManager = cardManager;
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
    this._playerHands.set(playerId, new CardContainer(this._cardManager));
    this._playerBanks.set(playerId, new CardContainer(this._cardManager));
    
    return playerModel;
  }

  makeNewCollectionForPlayer(playerId)
  {
    if(this._players.has(playerId)) {
      return this._playerCollections.insert(new Collection(playerId, this._cardManager));
    }

    return null;
  }

  getPlayer(playerId)
  {
    return this._players.get(playerId);
  }

  getPlayerHand(playerId)
  {
    return this._playerHands.get(playerId);
  }

  getPlayerBank(playerId)
  {
    return this._playerBanks.get(playerId);
  }

  removePlayer()
  {
    //@TODO
  }

  hasPlayer(playerId)
  {
    return this._players.has(playerId);
  }

  iterate(fn)
  {
    try {
      this._players.getAll().forEach((v) => {
        if(fn(v)) {
          throw "short circuit loop";
        }
      })
    } catch {
      // nop
    }
  }

  serialize()
  {
    return {
      players: this._players.serialize(),
      collections: this._playerCollections.serialize(),
      hands: this._playerHands.serialize(),
      banks: this._playerBanks.serialize(),
    };
  }

  unserialize(data)
  {
    this._players.unserialize(data.players);
    this._playerCollections.unserialize(data.collections);
    this._playerHands.unserialize(data.hands);
    this._playerBanks.unserialize(data.banks);
  }

}
