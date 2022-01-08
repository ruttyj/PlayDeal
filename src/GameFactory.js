const Game = require('./Game');

module.exports = class GameFactory {
  constructor()
  {

  }

  buildGame()
  {
    const game = new Game();
    return game; 
  }
}