const Manager = require('../base/Manager');
const CardFactory = require('./CardFactory');

module.exports = class CardManager extends Manager {

  static SCENARIO_CASH_ONLY = 'cashOnly';

  constructor()
  {
    super();
  }

  setup(type=null)
  {
    this._repo.reset();
    switch(type)
    {
      default:
      case this.SCENARIO_CASH_ONLY:
        this._factory = new CardFactory();
        this._generateCards(this._getCashOnlyCardCounts());
    }
  }

  getAllCards()
  {
    return this._repo.getAll();
  }

  getCard(cardId)
  {
    return this._repo.get(cardId);
  }

  _getCashOnlyCardCounts()
  {
    const cardCounts = new Map();

    cardCounts.set('CASH_10', 1);
    cardCounts.set('CASH_5', 2);
    cardCounts.set('CASH_4', 3);
    cardCounts.set('CASH_3', 3);
    cardCounts.set('CASH_2', 5);
    cardCounts.set('CASH_1', 6);

    return cardCounts;
  }

  _generateCards(cardCounts)
  {
    cardCounts.forEach((quantity, cardKey) => {
      for(let i = 0; i < quantity; ++i){
        const card = this._factory.make(cardKey);
        if(card){
          this._repo.insert(card);
        }
      }
    })
  }
}