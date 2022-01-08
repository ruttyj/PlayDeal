
const Card = require('./Card');

module.exports = class CardFactory {
  make(cardKey) {
    let card =  new Card();
    switch (cardKey) {
      case 'DRAW_CARDS':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(3);
        card.addTags([
          Card.TAG_DRAW, 
          Card.TAG_BANKABLE
        ]);
        card.addComp(Card.COMP_DRAW_CARD, {amount: 2});

        return card;
      case 'DEBT_COLLECTOR':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(3);
        card.addTags([
          Card.TAG_REQUEST,
          Card.TAG_COLLECT_VALUE,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);
        card.addComp(Card.COMP_COLLECT_VALUE, {
          amount: 5, 
          target: Card.TARGET_ONE
        });

        return card;
      case 'BIRTHDAY':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(2);
        card.addTags([
          Card.TAG_REQUEST,
          Card.TAG_COLLECT_VALUE,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);
        card.addComp(Card.COMP_COLLECT_VALUE, {
          amount: 2, 
          target: Card.TARGET_ALL
        });

        return card;
      case 'STEAL_COLLECTION':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(5);
        card.addTags([
          Card.TAG_REQUEST,
          Card.TAG_STEAL_COLLECTION,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);

        return card;
      case 'STEAL_PROPERTY':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(3);
        card.addTags([
          Card.TAG_REQUEST,
          Card.TAG_STEAL_PROPERTY,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);

        return card;
      case 'SWAP_PROPERTY':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(3);
        card.addTags([
          Card.TAG_REQUEST,
          Card.TAG_SWAP_PROPERTY,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);

        return card;
      case 'NOPE':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(4);
        card.addTags([
          Card.TAG_DECLINE_REQUEST,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);

        return card;
      case 'DOUBLE_THE_RENT':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(1);
        card.addTags([
          Card.TAG_RENT_AUGMENT,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);
        card.addComp(Card.COMP_COLLECT_VALUE_AUGMENT, {
          affects: {
            multiply: 2,
          },
          requires: {
            actionCard: {
              withTags: [Card.TAG_RENT],
              withoutTags: [],
            },
          },
        });

        return card;
      case 'DOUBLE_THE_RENT':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(1);
        card.addTags([
          Card.TAG_RENT_AUGMENT,
          Card.TAG_CONTESTABLE,
          Card.TAG_BANKABLE
        ]);
        card.addComp(Card.COMP_COLLECT_VALUE_AUGMENT, {
          affects: {
            multiply: 2,
          },
          requires: {
            actionCard: {
              withTags: [Card.TAG_RENT],
              withoutTags: [],
            },
          },
        });

        return card;
      case 'HOUSE':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(3);
        card.addTags([
          Card.TAG_SET_AUGMENT,
          Card.TAG_HOUSE,
          Card.TAG_BANKABLE
        ]);
        card.addComp(Card.COMP_SET_AUGMENT, {
          affects: {
            inc: 3,
          },
          requires: {
            fullSet: true,
            withoutTagsInSet: [
              Card.TAG_HOUSE,
              Card.TAG_UTILITY,
              Card.TAG_TRANSPORT,
            ]
          },
        });

        return card;
      case 'HOTEL':
        card.setType(Card.TYPE_ACTION);
        card.setKey(cardKey);
        card.setValue(4);
        card.addTags([
          Card.TAG_SET_AUGMENT,
          Card.TAG_HOTEL,
          Card.TAG_BANKABLE
        ]);
        card.addComp(Card.COMP_SET_AUGMENT, {
          affects: {
            inc: 4,
          },
          requires: {
            fullSet: true,
            withoutTagsInSet: [
              Card.TAG_HOTEL, // cannot have another hotel in set
            ],
            withTagsInSet: [
              Card.TAG_HOUSE,
            ],
          },
        });

        return card;
      case 'SUPER_RENT':
        card = this._makeBaseRentCard();
        card.setKey(cardKey);
        card.setValue(4);
        card.addComp(Card.COMP_RENT, {
          target: Card.TARGET_ONE,
          sets: [
            "blue",
            "green",
            "yellow",
            "red",
            "orange",
            "black",
            "purple",
            "cyan",
            "pink",
            "brown",
          ],
        });

        return card;
      case 'RENT_BLUE_GREEN':
        card = this._makeBaseRentCard();
        card.setKey(cardKey);
        card.addComp(Card.COMP_RENT, {
          target: Card.TARGET_ALL,
          sets: [
            "blue",
            "green",
          ],
        });

        return card;
      case 'RENT_ORANGE_PURPLE':
        card = this._makeBaseRentCard();
        card.setKey(cardKey);
        card.addComp(Card.COMP_RENT, {
          target: Card.TARGET_ALL,
          sets: [
            "orange", 
            "purple"
          ],
        });

        return card;
      case 'RENT_BLACK_PINK':
        card = this._makeBaseRentCard();
        card.setKey(cardKey);
        card.addComp(Card.COMP_RENT, {
          target: Card.TARGET_ALL,
          sets: [
            "black", "pink"
          ],
        });

        return card;
      case 'RENT_YELLOW_ORANGE':
        card = this._makeBaseRentCard();
        card.setKey(cardKey);
        card.addComp(Card.COMP_RENT, {
          target: Card.TARGET_ALL,
          sets: [
            "yellow", "orange"
          ],
        });

        return card;
      case 'RENT_BROWN_CYAN':
        card = this._makeBaseRentCard();
        card.setKey(cardKey);
        card.addComp(Card.COMP_RENT, {
          target: Card.TARGET_ALL,
          sets: [
            "cyan", "brown"
          ],
        });

        return card;
      case 'CASH_1':
        card = this._makeCashCard(1);
        card.setKey(cardKey);
        return card;
      case 'CASH_2':
        card = this._makeCashCard(2);
        card.setKey(cardKey);
        return card;
      case 'CASH_3':
        card = this._makeCashCard(3);
        card.setKey(cardKey);
        return card;
      case 'CASH_4':
        card = this._makeCashCard(4);
        card.setKey(cardKey);
        return card;
      case 'CASH_5':
        card = this._makeCashCard(5);
        card.setKey(cardKey);
        return card;
      case 'CASH_10':
        card = this._makeCashCard(10);
        card.setKey(cardKey);
        return card;
    }

    return null;
  }

  _makeCashCard(value)
  {
    const card = new Card();
    card.setType(Card.TYPE_CASH);
    card.setValue(value);
    card.addTags([
      Card.TAG_BANKABLE
    ]);
    return card;
  }

  _makeBaseRentCard()
  {
    const card = new Card();
    card.setType(Card.TYPE_ACTION);
    card.setValue(1);
    card.addTags([
      Card.TAG_REQUEST,
      Card.TAG_RENT,
      Card.TAG_CONTESTABLE,
      Card.TAG_BANKABLE
    ]);
    return card;
  }
}