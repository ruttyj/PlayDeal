const TagContainer = require('../card/TagContainer');
const RequestManager = require('../turn/request/Request');

module.exports = class Turn {
  static PHASE_DRAW = 'draw';
  static PHASE_ACTION = 'action';
  static PHASE_REQUEST = 'request';
  static PHASE_DISCARD = 'discard';
  static PHASE_DONE = 'done';

  static TAG_CARDS_DRAWN = 'cardsDrawn';

  constructor(game, playerId)
  {
    this._phases = [
      Turn.PHASE_DRAW, 
      Turn.PHASE_ACTION, 
      Turn.PHASE_REQUEST, 
      Turn.PHASE_DISCARD, 
      Turn.PHASE_DONE
    ];

    this._game = game;
    this._playerId = playerId;
    this._phase = Turn.PHASE_DRAW;
    this._tags = new TagContainer();
    this._requestManager = new RequestManager(game);
    this._actionLimit = 3;
    this._actionCount = 0;
  }

  getPlayerId()
  {
    return this._playerId;
  }

  setPhase(phase)
  {
    this._phase = phase;
  }

  getPhase()
  {
    return this._phase;
  }

  addTag(tag)
  {
    this._tags.add(tag);
  }
  
  addTags(tags)
  {
    tags.forEach(tag => {
      this._tags.add(tag);
    })
  }

  hasTag(tag)
  {
    return this._tags.has(tag);
  }

  removeTag(tag)
  {
    this._tags.remove(tag);
  }

  getActionLimit()
  {
    return this._actionLimit;
  }

  setActionLimit(value)
  {
    this._actionLimit = value;
  }

  getActionCount()
  {
    return this._actionCount;
  }
  
  consumeAction()
  {
    ++this._actionCount;
    if(this.getActionCount() === this.getActionLimit()) {
      this.nextPhase();
    }
  }

  isWithinActionLimit()
  {
    return this.getActionCount() < this.getActionLimit();
  }

  getCountCardsTooMany()
  {
    const playerManager = this._game.getPlayerManager();
    const playerHand = playerManager.getPlayerHand(this._playerId);
    const result = Math.max(0, playerHand.count() - this._game.getMaxCardsInHand());
    return result;
  }

  shouldDiscardCards()
  {
    return this.getCountCardsTooMany() > 0;
  }

  nextPhase()
  {
    const currentPhase = this.getPhase();
    let resultPhase = currentPhase;
    if (currentPhase !== Turn.PHASE_DONE) {
      switch(currentPhase) {
        case Turn.PHASE_DRAW:
          if(this.hasTag(Turn.TAG_CARDS_DRAWN)){
            resultPhase = Turn.PHASE_ACTION;
          }
          break;
        case Turn.PHASE_ACTION:
          if (this.shouldDiscardCards()) {
            resultPhase = Turn.PHASE_DISCARD;
          } else {
            resultPhase = Turn.PHASE_DONE;
          }
          break;
        case Turn.PHASE_REQUEST:
          // @TODO check if requests are all satisfied
          break;
        case Turn.PHASE_DISCARD:
          if (!this.shouldDiscardCards()) {
            resultPhase = Turn.PHASE_DONE;
          }
          break;
        default:
      }
      this.setPhase(resultPhase);
    }
  }

  serialize()
  {
    return {
      playerId:     this._playerId,
      phase:        this._phase,
      actionLimit:  this._actionLimit,
      actionCount:  this._actionCount,
    }
  }

  unserialize(data)
  {
    this._playerId = data.id;
    this._phase = data.phase;
    this._actionLimit = data.actionLimit;
    this._actionCount = data.actionCount;
  }
}