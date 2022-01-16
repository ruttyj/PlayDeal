module.exports = class Turn {
  static PHASE_DRAW = 'draw';
  static PHASE_ACTION = 'action';
  static PHASE_REQUEST = 'request';
  static PHASE_DISCARD = 'discard';
  static PHASE_DONE = 'done';

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

  _shouldDiscardCards()
  {
    const playerId = this._playerId;
    const playerManager = this._game.getPlayerManager();
    const playerHand = playerManager.getPlayerHand(playerId);

    return playerHand.count() > this._game.getMaxCardsInHand();
  }

  nextPhase()
  {
    let currentPhase = this.getPhase();
    if (currentPhase !== Turn.PHASE_DONE) {
      let goToEnd = true;
      // can still play?
      if(this.isWithinActionLimit()) {
        if ([Turn.PHASE_DRAW, Turn.PHASE_REQUEST].includes(currentPhase)) {
          this.setPhase(Turn.PHASE_ACTION);
          goToEnd = false;
        } 
      } 

      if (goToEnd) {
        // should discard?
        if (this._shouldDiscardCards()) {
          this.setPhase(Turn.PHASE_DIACARD);
        } else {
          this.setPhase(Turn.PHASE_DONE);
        }
      }
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