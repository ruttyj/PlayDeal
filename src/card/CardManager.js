const CardFactory = require('./CardFactory');
const Card = require('./Card');

const AutoIncRepo = require('../base/AutoIncRepo');
const PropertySet = require('./PropertySet');


module.exports = class CardManager  {

  static SCENARIO_CASH_ONLY = 'cashOnly';
  static SCENARIO_PROPERTY_ONLY = 'propertyOnly';
  static SCENARIO_PROPERTY_CASH = 'propertyCash';
  static SCENARIO_PROPERTY_PLUS_WILD = 'propertyPlusWild';
  static SCENARIO_DEFAULT = 'default';

  constructor()
  {
    this.reset();
  }

  reset()
  {
    this._cards = new AutoIncRepo();
    this._propertySets = new Map();
  }

  setup(type = null)
  {
    this._cards.reset();
    switch(type)
    {
      case CardManager.SCENARIO_CASH_ONLY:
        this._cashOnlyCards();
        break;

      case CardManager.SCENARIO_PROPERTY_CASH:
        this._cashOnlyCards();
        this._propertyOnlyCards();
        break;

      case CardManager.SCENARIO_PROPERTY_ONLY:
        this._propertyOnlyCards();
        break;

      case CardManager.SCENARIO_PROPERTY_PLUS_WILD:
        this._propertyOnlyCards();
        this._wildPropertyCards();
        break;
        
      case CardManager.SCENARIO_DEFAULT:
      default:
        this._defaultCards();
    }
  }

  _cashOnlyCards()
  {
    this._factory = new CardFactory();
    this._generateCards(this._getCardsForScenarioCashOnly());
  }

  _defaultCards()
  {
    this._factory = new CardFactory();
    this._generatePropertySets(this._getDefaultPropertySets());
    this._generateCards(this._getCardsForScenarioCashOnly());
  }

  _propertyOnlyCards()
  {
    this._generatePropertySets(this._getDefaultPropertySets());
  }

  _wildPropertyCards()
  {
    const cardCounts = {
      SUPER_WILD_PROPERTY: 2,
      WILD_PROPERTY_ORANGE_PURPLE: 2,
      WILD_PROPERTY_PINK_BLACK: 1,
      WILD_PROPERTY_GREEN_BLACK: 1,
      WILD_PROPERTY_CYAN_BLACK: 1,
      WILD_PROPERTY_CYAN_BROWN: 1,
      WILD_PROPERTY_GREEN_BLUE: 1,
      WILD_PROPERTY_RED_YELLOW: 2,
    }
    const cardTemplates = {
      SUPER_WILD_PROPERTY: {
        key: "SUPER_WILD_PROPERTY",
        tags: [Card.TAG_SUPERWILD_PROPERTY, Card.TAG_AMBIGIOUS_SET],
        set: PropertySet.AMBIGIOUS_SET,
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
          PropertySet.AMBIGIOUS_SET,
        ],
        value: 0,
      },
      WILD_PROPERTY_RED_YELLOW: {
        key: "WILD_PROPERTY_RED_YELLOW",
        set: "red",
        sets: ["red", "yellow"],
        tags: [],
        value: 3,
      },
      WILD_PROPERTY_GREEN_BLUE: {
        key: "WILD_PROPERTY_GREEN_BLUE",
        set: "blue",
        sets: ["green", "blue"],
        tags: [],
        value: 4,
      },
      WILD_PROPERTY_CYAN_BROWN: {
        key: "WILD_PROPERTY_CYAN_BROWN",
        set: "brown",
        sets: ["cyan", "brown"],
        tags: [],
        value: 1,
      },
      WILD_PROPERTY_CYAN_BLACK: {
        key: "WILD_PROPERTY_CYAN_BLACK",
        set: "cyan",
        sets: ["cyan", "black"],
        tags: [],
        value: 4,
      },
      WILD_PROPERTY_GREEN_BLACK: {
        key: "WILD_PROPERTY_GREEN_BLACK",
        set: "green",
        sets: ["green", "black"],
        tags: [],
        value: 4,
      },
      WILD_PROPERTY_PINK_BLACK: {
        key: "WILD_PROPERTY_PINK_BLACK",
        set: "pink",
        sets: ["pink", "black"],
        tags: [],
        value: 2,
      },
      WILD_PROPERTY_ORANGE_PURPLE: {
        key: "WILD_PROPERTY_ORANGE_PURPLE",
        set: "purple",
        sets: ["orange", "purple"],
        tags: [],
        value: 2,
      },
    };

    Object.keys(cardCounts).forEach((cardKey) => {
      const quantity = cardCounts[cardKey];
      const cardData = cardTemplates[cardKey];
      if(cardData) {
        for(let i = 0; i < quantity; ++i) {

          const card =  new Card();
          card.setType(Card.TYPE_PROPERTY);
          card.setKey(cardData.key);
          card.setValue(cardData.value);
          card.addTags([Card.TAG_PROPERTY, Card.TAG_WILD_PROPERTY, ...cardData.tags]);
          card.addMeta(Card.COMP_ACTIVE_SET, cardData.set);
          card.addMeta(Card.COMP_AVAILABLE_SETS, cardData.sets);
          
          this._cards.insert(card);
        }
      }
    });

  }
  
  getAllCards()
  {
    return this._cards.getAll();
  }

  findCards(fn)
  {
    const results = [];
    this._cards.forEach(card => {
      if(fn(card)) {
        results.push(card);
      }
    })
    return results;
  }

  getCard(cardId)
  {
    return this._cards.get(cardId);
  }

  _getCardsForScenarioCashOnly()
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
          this._cards.insert(card);
        }
      }
    })
  }

  _getDefaultPropertySets()
  {
    return {
      blue: {
        set: "blue",
        tags: [],
        colorCode: "#134bbf",
        rent: {
          "1": 3,
          "2": 8,
        },
        cards: [
          {
            name: "Penthouse Suite",
            key: "PROPERTY_BLUE_1",
            value: 4,
          },
          {
            name: "Lake Side",
            key: "PROPERTY_BLUE_2",
            value: 4,
          },
        ],
      },
      green: {
        set: "green",
        tags: [],
        colorCode: "#049004",
        rent: {
          "1": 2,
          "2": 4,
          "3": 7,
        },
        cards: [
          {
            name: "National Park",
            key: "PROPERTY_GREEN_1",
            value: 4,
          },
          {
            name: "North of Nowhere",
            key: "PROPERTY_GREEN_2",
            value: 4,
          },
          {
            name: "The Booneys",
            key: "PROPERTY_GREEN_3",
            value: 4,
          },
        ],
      },
      yellow: {
        set: "yellow",
        tags: [],
        colorCode: "#e8c700",
        rent: {
          "1": 2,
          "2": 4,
          "3": 6,
        },
        cards: [
          {
            name: "College Dorms",
            key: "PROPERTY_YELLOW_1",
            value: 3,
          },
          {
            name: "Thrift Shop",
            key: "PROPERTY_YELLOW_2",
            value: 3,
          },
          {
            name: "Friend's Couch",
            key: "PROPERTY_YELLOW_3",
            value: 3,
          },
        ],
      },
      red: {
        set: "red",
        tags: [],
        colorCode: "#a50c0c",
        rent: {
          "1": 2,
          "2": 3,
          "3": 6,
        },
        cards: [
          {
            name: "Papa Fried Chicken",
            key: "PROPERTY_RED_1",
            value: 2,
          },
          {
            name: "McDo",
            key: "PROPERTY_RED_2",
            value: 2,
          },
          {
            name: "Pizza Place",
            key: "PROPERTY_RED_3",
            value: 2,
          },
        ],
      },
      orange: {
        set: "orange",
        tags: [],
        colorCode: "#ff7100",
        rent: {
          "1": 1,
          "2": 3,
          "3": 5,
        },
        cards: [
          {
            name: "Hill-Billy Hay Stack",
            key: "PROPERTY_ORANGE_1",
            value: 2,
          },
          {
            name: "Trailer Park",
            key: "PROPERTY_ORANGE_2",
            value: 2,
          },
          {
            name: "The local bar",
            key: "PROPERTY_ORANGE_3",
            value: 2,
          },
        ],
      },
      black: {
        set: "black",
        cards: [
          {
            name: "Metro Lines",
            key: "PROPERTY_BLACK_1",
            value: 2,
          },
          {
            name: "Zuber",
            key: "PROPERTY_BLACK_2",
            value: 2,
          },
          {
            name: "Taxi Company",
            key: "PROPERTY_BLACK_3",
            value: 2,
          },
          {
            name: "Bus Company",
            key: "PROPERTY_BLACK_4",
            value: 2,
          },
        ],
        tags: ["transport"],
        colorCode: "#404040",
        rent: {
          "1": 1,
          "2": 3,
          "3": 3,
          "4": 4,
        },
      },
      purple: {
        set: "purple",
        tags: [],
        colorCode: "#940194",
        rent: {
          "1": 1,
          "2": 2,
          "3": 4,
        },
        cards: [
          {
            name: "Hair Salon",
            key: "PROPERTY_PURPLE_1",
            value: 2,
          },
          {
            name: "Spa",
            key: "PROPERTY_PURPLE_2",
            value: 2,
          },
          {
            name: "Yoga",
            key: "PROPERTY_PURPLE_3",
            value: 2,
          },
        ],
      },
      cyan: {
        set: "cyan",
        tags: [],
        colorCode: "#00b3d6",
        rent: {
          "1": 1,
          "2": 2,
          "3": 3,
        },
        cards: [
          {
            name: "Water Park",
            key: "PROPERTY_CYAN_1",
            value: 1,
          },
          {
            name: "The Local Beach",
            key: "PROPERTY_CYAN_2",
            value: 1,
          },
          {
            name: "AquaLand",
            key: "PROPERTY_CYAN_3",
            value: 1,
          },
        ],
      },
      pink: {
        set: "pink",
        tags: ["utility"],
        colorCode: "#d27eae",
        rent: {
          "1": 1,
          "2": 2,
        },
        cards: [
          {
            name: "Internet provider",
            key: "PROPERTY_PINK_1",
            value: 2,
          },
          {
            name: "Streaming Services",
            key: "PROPERTY_PINK_2",
            value: 2,
          },
        ],
      },
      brown: {
        set: "brown",
        tags: [],
        colorCode: "#824b00",
        rent: {
          "1": 1,
          "2": 2,
        },
        cards: [
          {
            name: "Cardboard Box",
            key: "PROPERTY_BROWN_1",
            value: 1,
          },
          {
            name: "Trash bin",
            key: "PROPERTY_BROWN_2",
            value: 1,
          },
        ],
      },
    };
  }

  _generatePropertySets(properties)
  {
    Object.keys(properties).forEach(code => {
      const data = properties[code];

      const propertySet = new PropertySet();
      propertySet.setCode(code);
      propertySet.setColorCode(data.colorCode);
      propertySet.addTags(data.tags);
      propertySet.setSize(data.cards.length);
      Object.keys(data.rent).forEach(cardCount => {
        const rentValue = data.rent[cardCount];
        propertySet.setRentValue(cardCount, rentValue);
      });


      // Create property cards for set
      Object.keys(data.cards).forEach(cardIndex => {
        const cardData = data.cards[cardIndex];

        const card =  new Card();
        card.setType(Card.TYPE_PROPERTY);
        card.setKey(cardData.key);
        card.setValue(cardData.value);
        card.addTags([Card.TAG_PROPERTY, ...data.tags]);
        card.addMeta(Card.COMP_ACTIVE_SET, code);

        this._cards.insert(card);
      })

      this._propertySets.set(code, propertySet);
    })
  }

  getPropertySet(propertySetId)
  {
    return this._propertySets.get(propertySetId);
  }

  getAllPropertySetIds()
  {
    let result = [];
    this._propertySets.forEach((value, key) => {
      result.push(key);
    });

    return result;
  }

  getAllPropertySets()
  {
    let result = [];
    this._propertySets.forEach((value, key) => {
      result.push(value);
    });

    return result;
  }

  _makePropertySet(type=null)
  {
    switch(type)
    {
      default:
        const propertySet = new PropertySet();
        return propertySet;
    }
  }

  serialize()
  {
    return {
      cards: this._cards.serialize(),
      propertySets: this.getAllPropertySets().map(p => p.serialize())
    };
  }

  unserialize(encoded)
  {
    const decoded = this.decode(encoded);
    this._cards.unserialize(decoded.cards);
  }
}