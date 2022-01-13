const srcPath = '../src';
const PlayerManager = require(srcPath + '/player/PlayerManager');
const CardManager = require(srcPath + '/card/CardManager');
const Player = require(srcPath + '/player/Player');
const RandomNumberGen = require(srcPath + '/utils/RandomNumberGen');
const CardContainer = require(srcPath + '/card/CardContainer');

module.exports = class Game {

  static SCENARIO_CASH_ONLY = 'cashOnly';
  static SCENARIO_DEFAULT = 'default';

  constructor()
  {
    this._playerManager = new PlayerManager();

    this._hasStarted = false;
    this._hasEnded = false;
    this._minPlayerLimit = 2;
    this._cardManager = new CardManager();
    this._scenario = this.SCENARIO_DEFAULT;
    this._rng = new RandomNumberGen(); // keep random numbers reproducable
    this._deck = new CardContainer(this._cardManager);
    this._activePile = new CardContainer(this._cardManager);
    this._discardPile = new CardContainer(this._cardManager);
    this._turnStartingCardCount = 5;
  }

  setSeed(seed)
  {
    this._rng.setSeed(seed);
  }

  getSeed()
  {
    return this._rng.getSeed();
  }

  setScenario(scenario)
  {
    this._scenario = scenario;
  }

  getScenario()
  {
    return this._scenario;
  }

  addPlayer()
  {
    if(!this._hasStarted){
      return this._playerManager.addPlayer();
    }
  }

  getPlayer(playerId)
  {
    return this._playerManager.getPlayer(playerId);
  }

  getAllPlayers()
  {
    return this._playerManager.getAll();
  }

  getPlayerCount()
  {
    return this._playerManager.getPlayerCount();
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
    this._initCardManager();
    this._generateDeck();
  }

  _initCardManager()
  {
    let cardLoadout; 
    switch(this._scenario)
    {
      case this.SCENARIO_CASH_ONLY:
        cardLoadout = CardManager.SCENARIO_CASH_ONLY;
        break
      case this.SCENARIO_DEFAULT:
      default:
        cardLoadout = CardManager.SCENARIO_DEFAULT;
    }

    this._cardManager.setup(cardLoadout);
  }

  _generateDeck()
  {
    const cards = this._cardManager.getAllCards();
    this._deck.addCards(cards);
    this._deck.shuffle(this._rng);
  }

  getDeck()
  {
    return this._deck;
  }

  getActivePile()
  {
    return this._activePile;
  }

  getDiscardPile()
  {
    return this._discardPile;
  }

  recycleCards()
  {
    const activePile = this.getActivePile();
    const discardPile = this.getDiscardPile();
    const deck = this.getDeck();

    deck.addCards(activePile.giveCards(activePile.getAllCardIds()));
    deck.addCards(discardPile.giveCards(discardPile.getAllCardIds()));
    deck.shuffle(this._rng);
  }

  drawCardFromDeck()
  {
    const deck = this.getDeck();
    if(deck.count() === 0){
      this.recycleCards();
    }
    return deck.pop();
  }

  drawCardForPlayer(playerId)
  {
    //const playerHand = 
  }

  drawGameStartingCards()
  {
    //this._turnStartingCardCount
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