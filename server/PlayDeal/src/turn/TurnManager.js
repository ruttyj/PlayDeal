const Turn = require('./Turn');

module.exports = class TurnManager {
  constructor(game)
  {
    this._game = game;
    this._currentTurn = null;
    this._playerIndex = 0;
  }

  setup()
  {
    this._newTurn();
  }
  _getPlayerManager()
  {
    return this._game.getPlayerManager();
  }

  _incPlayerIndex()
  {
    const playerManager = this._getPlayerManager();
    const playerCount = playerManager.getPlayerCount();
    this._playerIndex = (this._playerIndex + 1) % playerCount;
  }

  _newTurn()
  {
    const playerManager = this._getPlayerManager();
    const playerCycle = playerManager.getAllPlayerIds();
    this._currentTurn = new Turn(this._game, playerCycle[this._playerIndex]);
  }

  nextTurn()
  {
    if(!this._game.isGameOver() && this._currentTurn.getPhase() === Turn.PHASE_DONE) {
      this._incPlayerIndex();
      this._newTurn();
    }
  }

  getTurn()
  {
    return this._currentTurn;
  }

  serialize()
  {
    return {
      turn: this.getTurn().serialize(),
      playerIndex: this._playerIndex,
    }
  }

  unserialize(data)
  {
    //@TODO
  }
}
