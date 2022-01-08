const PlayerManager = require('../src/player/PlayerManager');
const CardManager = require('../src/card/CardManager');
const Player = require('../src/player/Player');
const RandomNumberGen = require('../src/utils/RandomNumberGen');
module.exports = class Game {
  constructor()
  {
    this._playerManager = new PlayerManager();
    this._hasStarted = false;
    this._hasEnded = false;
    this._minPlayerLimit = 2;
    this._cardManager = new CardManager();
    this._rng = new RandomNumberGen(); // keep random numbers reproducable
  }

  setSeed(seed)
  {
    this._rng.setSeed(seed);
  }

  getSeed()
  {
    return this._rng.getSeed();
  }

  addPlayer()
  {
    if(!this._hasStarted){
      return this._playerManager.addPlayer();
    }
  }

  getAllPlayers()
  {
    return this._playerManager.getAll();
  }

  getPlayerCount()
  {
    return this._playerManager.getCount();
  }

  canStart()
  {
    return !this._hasStarted && !this._hasEnded && this._hasEnoughPeopleToStart();
  }

  _hasEnoughPeopleToStart()
  {
    return this._minPlayerLimit <= this.getPlayerCount();
  }

  start()
  {
    this._hasStarted = true;
    this.generateDeck();
  }

  generateDeck()
  {
    this._cardManager.setup();

    const cards = this._cardManager.getAllCards();
    

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
    const result = {
      seed: this.getSeed(),
      hasStarted: this._hasStarted,
      hasEnded: this._hasEnded,
      minPlayerLimit: this._minPlayerLimit,
    };
    result.players = this._playerManager.serialize();
    result.cards = this._cardManager.serialize();

    return this.encode(result);
  }

  unserialize(encoded)
  {
    const data = this.decode(encoded);

    this.setSeed(data.seed);
    this._hasStarted = data.hasStarted;
    this._hasEnded = data.hasEnded;
    this._minPlayerLimit = data.minPlayerLimit;
    this._playerManager.unserialzie(data.players);
    this._cardManager.unserialzie(data.cards);
  }
}