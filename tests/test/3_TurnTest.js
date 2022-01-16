const { assert } = require('chai');
const { describe, it } = require('mocha');

const srcPath = '../../src';

const Game = require(srcPath + '/Game');
const Turn = require(srcPath + '/turn/Turn');
const TurnManager = require(srcPath + '/turn/TurnManager');

const runThisTest = true;

const log = (item) => {
  console.log(JSON.stringify(item))
}

const makeCashOnlyGame = () => {
  const game = new Game();
  game.setSeed('test');
  game.setScenario(Game.SCENARIO_CASH_ONLY);

  game.addPlayer();
  game.addPlayer();

  game.start();

  return game;
}
      
if(runThisTest) {

  describe("TurnManager", () => {

    it('First turn should belong to the first player', () => {
      const game = makeCashOnlyGame();
      const turnManager = game.getTurnManager();
      const turn = turnManager.getTurn();
      turn.nextPhase();
      turn.nextPhase();
      turnManager.nextTurn();

      console.log(turnManager.serialize());
    });
  })
}
