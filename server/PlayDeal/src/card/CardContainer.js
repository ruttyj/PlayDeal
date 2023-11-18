const {
  getIdFromObj
} = require('../utils/objectMethods');

module.exports = class CardContainer {
  constructor(cardManager)
  {
    this._cardManager = cardManager;
    this.reset();
  }

  reset()
  {
    this._items = new Map();
  }

  _getId(cardOrId)
  {
    return parseInt(getIdFromObj(cardOrId, 'getId()'), 10);
  }

  _getCard(cardId)
  {
    return this._cardManager.getCard(cardId);
  }

  addCard(cardOrId)
  {
    const cardId = this._getId(cardOrId);
    try{
      const card = this._getCard(cardId);
      if(card){
        this._items.set(cardId, true);
      }
    } catch {
      console.log('No card manager defined');
    }

    return this;
  }

  addCards(cardOrCards)
  {
    if (Array.isArray(cardOrCards)){
      cardOrCards.forEach((card) => {
        this.addCard(card);
      });
    }
    else {
      this.addCard(cardOrCards);
    }

    return this;
  }

  hasCard(cardOrId)
  {
    const cardId = this._getId(cardOrId);
    return this._items.has(cardId);
  }

  // must be in items
  getCard(cardOrId)
  {
    const cardId = this._getId(cardOrId);
    if (this.hasCard(cardId)) {
      return this._getCard(cardId);
    }

    return null;
  }

  getAllCardIds()
  {
    const result = [];
    this._items.forEach((card, cardId) => {
      result.push(cardId);
    })
    return result;
  }

  getAllCards()
  {
    const result = [];
    this._items.forEach((card, cardId) => {
      result.push(this.getCard(cardId));
    });
    return result;
  }

  getCards(cardsOrIds)
  {
    const result = [];
    if (Array.isArray(cardsOrIds)) {
      cardsOrIds.forEach(cardOrId => {
        const cardId = this._getId(cardOrId);
        if(this.hasCard(cardId)) {
          result.push(this.getCard(cardId));
        }
      })
    }
    return result;
  }

  count()
  {
    return this._items.size;
  }

  cardCount()
  {
    return this._items.size;
  }

  removeCard(cardOrId)
  {
    const cardId = this._getId(cardOrId);
    this._items.delete(cardId);
  }

  removeCards(cardsOrIds)
  {
    cardsOrIds.forEach(cardOrId => {
      this.removeCard(cardOrId);
    })
  }

  giveCard(cardOrId)
  {
    const cardId = this._getId(cardOrId);
    const card = this._getCard(cardId);
    if(card){
      this.removeCard(cardId);
      return card;
    }
    return null;
  }

  giveCards(cardsOrIds)
  {
    const result = [];
    cardsOrIds.forEach(cardOrId => {
      const card = this.giveCard(cardOrId);
      if(card){
        result.push(card);
      }
    })
    return result;
  }

  replaceAllCards(newCards)
  {
    this.reset();
    this.addCards(newCards);
  }

  getBottomCards(num)
  {
    const result = [];
    const cardIds = this.getAllCardIds();
    const count = cardIds.length;
    const stopIndex = Math.min(Math.abs(num), count) - 1;

    for (let i = 0; i <= stopIndex; ++i) {
      const cardId = cardIds[i];
      const card = this.getCard(cardId);
      if (card) {
        result.push(card);
      }
    }
    return result;
  }

  getTopCards(num)
  {
    const result = [];
    const cardIds = this.getAllCardIds();
    const count = cardIds.length;
    const lastIndex = count - 1;
    const _num = Math.min(Math.abs(num), count);
    const stopIndex = lastIndex - _num;

    for (let i = lastIndex; i > stopIndex; --i){
      const cardId = cardIds[i];
      const card = this.getCard(cardId);
      if (card) {
        result.push(card);
      }
    }

    return result;
  }

  getTopCard()
  {
    const topCards = this.getTopCards(1);
    if (topCards.length > 0) {
      return topCards[0];
    }
    return null;
  }

  pop() {
    return this.giveCard(this.getTopCard());
  }

  findCard(fn) {
    let result = null;

    try {
      this._items.forEach((junk, cardId) => {
        const card = this.getCard(cardId);
        if(fn(card)){
          result = card;
          throw "break loop";
        }
      })
    } catch {
      // nope
    }

    return result;
  }

  findCards(fn) {
    let result = [];

    this._items.forEach((junk, cardId) => {
      const card = this.getCard(cardId);
      if(fn(card)){
        result.push(card);
      }
    })

    return result;
  }
  
  shuffle(rng)
  {
    const cards = this.getAllCardIds();
    const shuffled = this._shuffle(cards, rng);
    this.replaceAllCards(shuffled);
  }

  _shuffle(cards, rng) {
    const temp = [...cards];

    const doShuffle = (temp) => {
      let lastIndex, selectedIndex;
      lastIndex = temp.length - 1;
      while (lastIndex > 0) {
        selectedIndex = rng.randIntBetween(0, lastIndex);
        [temp[lastIndex], temp[selectedIndex]] = [
          temp[selectedIndex],
          temp[lastIndex],
        ];
        --lastIndex;
      }
    };

    doShuffle(temp);
    doShuffle(temp);

    return temp;
  }

  serialize()
  {
    return this.getAllCardIds();
  }

  unserialize(data)
  {
    this.reset();
    data.forEach(cardId => {
      this.addCard(cardId);
    })
  }
}
