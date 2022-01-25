const CardContainer = require('./CardContainer');
const Card = require('./Card');
const PropertySet = require('./PropertySet');

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

    const collection = this;
    const card = this.getCard(cardOrId);
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

    return this;
  }

  addCards(cardOrCards)
  {
    this.addCards(cardOrCards);

    return this;
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

  getAugmentCards()
  {
    return this.findCards(card => card.hasTag(Card.TAG_SET_AUGMENT));
  }

  getPropertyCards()
  {
    return this.findCards(card => card.hasTag(Card.TAG_PROPERTY));
  }

  getPropertyCardCount()
  {
    return this.getPropertyCards().length;
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

  findCard(fn)
  {
    return this._cards.findCard(fn);
  }

  findCards(fn)
  {
    return this._cards.findCards(fn);
  }

  calculateRent()
  {
    let result;


    const propertyCount = this.getPropertyCardCount();
    const propertySet = this.getPropertySet();
    const baseRentValue = propertySet.getRentValue(propertyCount);
    result = baseRentValue;

    // @TODO
    //const augments = this.getAugmentCards();

    return result;
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
