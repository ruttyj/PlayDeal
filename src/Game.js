const srcPath = '../src';
const PlayerManager = require(srcPath + '/player/PlayerManager');
const CardManager = require(srcPath + '/card/CardManager');
const TurnManager = require(srcPath + '/turn/TurnManager');
const RandomNumberGen = require(srcPath + '/utils/RandomNumberGen');
const CardContainer = require(srcPath + '/card/CardContainer');
const Turn = require(srcPath + '/turn/Turn');

module.exports = class Game {

  static SCENARIO_CASH_ONLY = 'cashOnly';
  static SCENARIO_DEFAULT = 'default';

  constructor()
  {
    this._cardManager = new CardManager();
    this._playerManager = new PlayerManager(this._cardManager);
    this._turnManager = new TurnManager(this);
    this._rng = new RandomNumberGen(); // keep random numbers reproducable

    this._deck = new CardContainer(this._cardManager);
    this._activePile = new CardContainer(this._cardManager);
    this._discardPile = new CardContainer(this._cardManager);

    this._scenario = Game.SCENARIO_DEFAULT;
    this._minPlayerLimit = 2; // min players to start a game
    this._gameStartingCardCount = 5; // cards given to player at beginning of game
    this._turnStartingCardCount = 2; // number of cards to be collected on turn start
    this._maxCardsInHand = 7; // max cards in hand at end of turn

    this._hasStarted = false;
    this._hasEnded = false;
  }

  getPlayerManager()
  {
    return this._playerManager;
  }

  getTurnManager()
  {
    return this._turnManager;
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

  getPlayerHand(playerId)
  {
    return this._playerManager.getPlayerHand(playerId);
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
    // Setup managers
    this._initCardManager();
    this._playerManager.setup();
    this._turnManager.setup();

    this._generateDeck();

    this._hasStarted = true;

    // Give out cards to players
    this._dealInitialCards();

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

  _recycleCards()
  {
    const activePile = this.getActivePile();
    const discardPile = this.getDiscardPile();
    const deck = this.getDeck();

    deck.addCards(activePile.giveCards(activePile.getAllCardIds()));
    deck.addCards(discardPile.giveCards(discardPile.getAllCardIds()));
    deck.shuffle(this._rng);
  }

  _drawCardFromDeck()
  {
    const deck = this.getDeck();
    if(deck.count() === 0){
      this._recycleCards();
    }
    return deck.pop();
  }

  _drawCardForPlayer(playerId)
  {
    const hand = this._playerManager.getPlayerHand(playerId);
    const card = this._drawCardFromDeck();
    hand.addCard(card);
  }

  _dealInitialCards()
  {
    for(let i = 0 ; i < this._gameStartingCardCount; ++i) {
      this._playerManager.iterate(player => {
        this._drawCardForPlayer(player.getId());
      })
    }
  }

  dealTurnStartingCards()
  {
    const turn = this._turnManager.getTurn();
    if(turn.getPhase() === Turn.PHASE_DRAW) {
      for(let i = 0; i < this._turnStartingCardCount; ++i) {
        this._drawCardForPlayer(turn.getPlayerId());
      }
      turn.nextPhase();
    }
  }

  putCardInBankFromHand(cardId)
  {
    const turn = this._turnManager.getTurn();
    if(turn.isWithinActionLimit()) {
      const playerId = turn.getPlayerId();
      const playerManager = this._playerManager;
      const playerHand = playerManager.getPlayerHand(playerId);
      const playerBank = playerManager.getPlayerBank(playerId);
      if(playerHand.hasCard(cardId)) {
        playerBank.addCard(playerHand.giveCard(cardId));
        turn.consumeAction();
      }
    }
  }

  getMaxCardsInHand()
  {
    return this._maxCardsInHand;
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
    result.turn = this._turnManager.serialize();
    //result.cards = this._cardManager.serialize(); // @TODO uncomment

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
    this._turnManager.unserialzie(data.turn);
    //this._cardManager.unserialzie(data.cards); // @TODO uncomment
  }
}