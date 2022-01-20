const CardContainer = require('./CardContainer');
const Card = require('./Card');

module.exports = class Collection {
  constructor(playerId, cardManager)
  {
    this._cardManager = cardManager;
    this.reset();
    this.setPlayerId(playerId);
  }

  reset()
  {
    this._id = 0;
    this._playerId = null;
    this._activeSet = null;
    this._cards = new CardContainer(this._cardManager);
  }

  setId(id)
  {
    this._id = id;
  }

  getId()
  {
    return this._id;
  }

  setPlayerId(playerId)
  {
    this._playerId = playerId;
  }

  getPlayerId()
  {
    return this._playerId;
  }

  setActiveSet(set)
  {
    this._activeSet = set;
  }

  getActiveSet()
  {
    return this._activeSet
  }

  getPropertySet()
  {
    const propertySet = this._cardManager.getPropertySet(this._activeSet);
    return propertySet ? propertySet : null;
  }

  isComplete()
  {
    const propertySet = this.getPropertySet();
    if(propertySet) {
      const propertyCards = this._cards.findCards((card) => card.hasTag(Card.TAG_PROPERTY));
      return propertyCards.length === propertySet.getSize();
    }
    return false;
  }

  addCard(cardOrId)
  {
    this._cards.addCard(cardOrId);
  }

  addCards(cardOrCards)
  {
    this._cards.addCards(cardOrCards);
  }

  hasCard(cardOrId)
  {
    return this._cards.hasCard(cardOrId);
  }

  getCard(cardOrId)
  {
    return this._cards.getCard(cardOrId);
  }

  getAllCardIds()
  {
    return this._cards.getAllCardIds();
  }

  getAllCards()
  {
    return this._cards.getAllCards();
  }

  getCards(cardsOrIds)
  {
    return this._cards.getCards(cardsOrIds);
  }

  cardCount()
  {
    return this._cards.count();
  }

  removeCard(cardOrId)
  {
    this._cards.removeCard(cardOrId);
  }

  giveCard(cardOrId)
  {
    return this._cards.giveCard(cardOrId);
  }

  giveCards(cardsOrIds)
  {
    return this._cards.giveCards(cardsOrIds);
  }

  replaceAllCards(newCards)
  {
    this.reset();
    this._cards.replaceAllCards(newCards);
  }

  findCard(fn) {
    return this._cards.findCard(fn);
  }

  findCards(fn) {
    return this._cards.findCards(fn);
  }

  serialize()
  {
    return {
      id: this._id,
      playerId: this._playerId,
      activeSet: this._activeSet,
      isComplete: this.isComplete(),
      cards: this._cards.serialize()
    }
  }

  unserialize(data)
  {
    this.reset();
    this._cards.unserialize(data.cards);
  }
}
