const srcPath = '../src';
const PlayerManager = require(srcPath + '/player/PlayerManager');
const CardManager = require(srcPath + '/card/CardManager');
const TurnManager = require(srcPath + '/turn/TurnManager');
const RandomNumberGen = require(srcPath + '/utils/RandomNumberGen');
const CardContainer = require(srcPath + '/card/CardContainer');
const Turn = require(srcPath + '/turn/Turn');
const Card = require(srcPath + '/card/Card');
const PropertySet = require(srcPath + '/card/PropertySet');

module.exports = class Game {

  static SCENARIO_CASH_ONLY = 'cashOnly';
  static SCENARIO_PROPERTY_ONLY = 'propertyOnly';
  static SCENARIO_PROPERTY_PLUS_WILD = 'propertyPlusWild';
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
      case Game.SCENARIO_CASH_ONLY:
        cardLoadout = CardManager.SCENARIO_CASH_ONLY;
        break

      case Game.SCENARIO_PROPERTY_ONLY:
        cardLoadout = CardManager.SCENARIO_PROPERTY_ONLY;
        break;
      
      case Game.SCENARIO_PROPERTY_PLUS_WILD:
        cardLoadout = CardManager.SCENARIO_PROPERTY_PLUS_WILD;
        break;

      case Game.SCENARIO_DEFAULT:
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

  playCardToBankFromHand(cardId)
  {
    const turn = this._turnManager.getTurn();
    if(turn.isWithinActionLimit()) {
      const playerManager = this._playerManager;
      const playerId = turn.getPlayerId();
      const playerHand = playerManager.getPlayerHand(playerId);
      const playerBank = playerManager.getPlayerBank(playerId);
      if(playerHand.hasCard(cardId)) {
        playerBank.addCard(playerHand.giveCard(cardId));
        turn.consumeAction();
      }
    }
  }

  playCardToNewCollectionFromHand(cardId)
  {
    const turn = this._turnManager.getTurn();
    if(turn.isWithinActionLimit()) {
      const playerManager = this._playerManager;
      const playerId = turn.getPlayerId();
      const playerHand = playerManager.getPlayerHand(playerId);

      if(playerHand.hasCard(cardId)) {
        const newCollection = playerManager.makeNewCollectionForPlayer(playerId);
        newCollection.addCard(playerHand.giveCard(cardId));
        this._updateCollectionAndCard(newCollection.getId(), cardId);
        turn.consumeAction();
      }
    }
  }

  playCardToExistingCollectonFromHand(cardId, collectionId)
  {
    const turn = this._turnManager.getTurn();
    if(turn.isWithinActionLimit()) {
      const playerManager = this._playerManager;
      const playerId = turn.getPlayerId();
      const playerHand = playerManager.getPlayerHand(playerId);

      if(playerHand.hasCard(cardId)) {
        const collection = playerManager.getCollection(collectionId);
        if(collection && collection.getPlayerId() === playerId) {
          collection.addCard(playerHand.giveCard(cardId));
          this._updateCollectionAndCard(collection.getId(), cardId);
          turn.consumeAction();
        }
      }
    }
  }

  _cleanUpCollection(collectionId)
  {
    const playerManager = this._playerManager;
    const collection = playerManager.getCollection(collectionId);

    // @TODO check for setAugments move to empty set if nessary

    if(collection.cardCount() === 0) {
      playerManager.deleteCollection(collectionId);
    }
  }

  _canAddCardToCollection(cardId, collectionId)
  {
    const playerManager = this._playerManager;
    const cardManager = this._cardManager;

    const card = cardManager.getCard(cardId);
    const collection = playerManager.getCollection(collectionId);

    if(card.hasTag(Card.TAG_WILD_PROPERTY)) {
      // @TODO
    } else if(card.hasTag(Card.TAG_PROPERTY)) {
      const cardActiveSet = card.getMeta(Card.COMP_ACTIVE_SET);
      if([null, cardActiveSet].includes(collection.getActiveSet())) {
        return true;
      }
    } else if(card.hasTag(Card.TAG_SET_AUGMENT)) {
      // @TODO
    }
  }

  // makes sure the card and collection are the same property set
  _updateCollectionAndCard(collectionId, cardId)
  {
    const playerManager = this._playerManager;
    const cardManager = this._cardManager;

    const card = cardManager.getCard(cardId);
    const collection = playerManager.getCollection(collectionId);
    const collectionActiveSet = collection.getActiveSet();

    let applyCardSetToCollection = false;
    if(card.hasTag(Card.TAG_WILD_PROPERTY)) {
      applyCardSetToCollection = true;
    } else if(card.hasTag(Card.TAG_PROPERTY)) {
      applyCardSetToCollection = true;
    }

    if(applyCardSetToCollection) {
      // if collection is ambigious or undefined
      if([null, PropertySet.AMBIGIOUS_SET].includes(collectionActiveSet)) {
        // get active property set from card
        const activeSet = card.getMeta(Card.COMP_ACTIVE_SET);
        if(activeSet) {
          collection.setActiveSet(activeSet);
        }
      }
    }
  }

  transferCardToNewCollectionFromCollection(collectionId, cardId)
  {
    const playerManager = this._playerManager;
    const turn = this._turnManager.getTurn();
    const playerId = turn.getPlayerId();

    const collection = playerManager.getCollection(collectionId);
    if(collection.hasCard(cardId) && collection.getPlayerId() === playerId) {
      const newCollection = playerManager.makeNewCollectionForPlayer(playerId);
      newCollection.addCard(collection.giveCard(cardId));
      this._updateCollectionAndCard(collectionId, cardId);
      this._cleanUpCollection(collectionId);
    }
  }

  transferCardToExistingCollectionFromCollection(collectionAId, cardId, collectionBId)
  {
    const playerManager = this._playerManager;
    const turn = this._turnManager.getTurn();
    const playerId = turn.getPlayerId();

    const collectionA = playerManager.getCollection(collectionAId);
    if(collectionA && collectionA.hasCard(cardId) && collectionA.getPlayerId() === playerId) {
      const collectionB = playerManager.getCollection(collectionBId);

      if(collectionB.getPlayerId() === playerId) {
        if(this._canAddCardToCollection(cardId, collectionB.getId())) {
          collectionB.addCard(collectionA.giveCard(cardId));
          this._updateCollectionAndCard(collectionBId, cardId);
          this._cleanUpCollection(collectionAId);
        }
      }
    }
  }

  changeWildCardColorInCollection(cardId, collectionId)
  {
    // @TODO
  }

  changeWildCardColorInHand(cardId)
  {
    // @TODO
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