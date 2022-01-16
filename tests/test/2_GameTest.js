const { assert } = require('chai');
const { describe, it } = require('mocha');

const Game = require('../../src/Game');
const Turn = require('../../src/turn/Turn');
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

  describe("PlayDeal Game", () => {

    it('Should deal 5 cards to each player', () => {
      const game = makeCashOnlyGame();

      const player1Id = 1;
      const player2Id = 2;

      // deck should be shuffled
      const deck = game.getDeck();
      const expectedDeckOrder = JSON.stringify([
        15, 33, 11, 46, 27, 36, 29, 32, 45,  8,
        34,  9, 40, 30, 48, 43, 24,  4,  2, 14,
        22, 38, 47, 13, 12, 31, 39, 41,  1, 35,
        10,  6, 25, 20, 16, 23,  3, 37
      ]);
      assert.equal(JSON.stringify(deck.getAllCardIds()), expectedDeckOrder);

      // Players should have their hands
      const player1Hand = game.getPlayerHand(player1Id);
      const player2Hand = game.getPlayerHand(player2Id);
      assert.equal(JSON.stringify(player1Hand.getAllCardIds()), '[42,19,18,7,28]');
      assert.equal(JSON.stringify(player2Hand.getAllCardIds()), '[26,21,44,5,17]');
    });

    it('Happy Path - Loop through turn phases and player turns', () => {
      const game = makeCashOnlyGame();
      const turnManager = game.getTurnManager();

      // Get first player
      // Cycle through phases
      if(1) {
        const turn = turnManager.getTurn();
        assert.equal(turn.getPlayerId(), 1);
        assert.equal(turn.getPhase(), Turn.PHASE_DRAW);
        turn.nextPhase();
        assert.equal(turn.getPhase(), Turn.PHASE_ACTION);
        turn.nextPhase();
        assert.equal(turn.getPhase(), Turn.PHASE_DONE);
      }
      
      // try going to next turn
      if(1) {
        turnManager.nextTurn();
        const turn = turnManager.getTurn();
        assert.equal(turn.getPlayerId(), 2);
      }

      // should circle around to the first player
      if(1) {
        turnManager.nextTurn();
        const turn = turnManager.getTurn();
        assert.equal(turn.getPlayerId(), 1);
      }
    });

    it('Deal turn starting cards', () => {
      const game = makeCashOnlyGame();
      const turnManager = game.getTurnManager();
      const turn = turnManager.getTurn();
      const playerId = turn.getPlayerId();
      const playerManager = game.getPlayerManager();
      const playerHand = playerManager.getPlayerHand(playerId);

      game.dealTurnStartingCards();

      assert.equal(turn.getPlayerId(), 1);
      assert.equal(JSON.stringify(playerHand.getAllCardIds()), '[42,19,18,7,28,37,3]');
      assert.equal(turn.getPhase(), Turn.PHASE_ACTION);

      // Attempt to be cheekey and draw again
      game.dealTurnStartingCards();
      assert.equal(turn.getPlayerId(), 1);
      assert.equal(JSON.stringify(playerHand.getAllCardIds()), '[42,19,18,7,28,37,3]');
      assert.equal(turn.getPhase(), Turn.PHASE_ACTION);
    });

    it('Place card in bank from hand', () => {
      const game = makeCashOnlyGame();
      const turnManager = game.getTurnManager();
      const turn = turnManager.getTurn();
      const playerId = turn.getPlayerId();
      const playerManager = game.getPlayerManager();

      game.dealTurnStartingCards();

      const playerHand = playerManager.getPlayerHand(playerId);
      const playerBank = playerManager.getPlayerBank(playerId);

      // Action 1
      game.putCardInBankFromHand(19);
      assert.equal(JSON.stringify(playerHand.getAllCardIds()), '[42,18,7,28,37,3]');
      assert.equal(JSON.stringify(playerBank.getAllCardIds()), '[19]');
      assert.equal(turn.getActionCount(), 1);
      assert.equal(turn.getPhase(), Turn.PHASE_ACTION);

      // Action 2
      game.putCardInBankFromHand(18);
      assert.equal(JSON.stringify(playerHand.getAllCardIds()), '[42,7,28,37,3]');
      assert.equal(JSON.stringify(playerBank.getAllCardIds()), '[19,18]');
      assert.equal(turn.getActionCount(), 2);
      assert.equal(turn.getPhase(), Turn.PHASE_ACTION);

      // Action 3
      game.putCardInBankFromHand(28);
      assert.equal(JSON.stringify(playerHand.getAllCardIds()), '[42,7,37,3]');
      assert.equal(JSON.stringify(playerBank.getAllCardIds()), '[19,18,28]');
      assert.equal(turn.getActionCount(), 3);
      assert.equal(turn.getPhase(), Turn.PHASE_DONE);

      // Attempt to play one more than we have actions for
      game.putCardInBankFromHand(37);
      assert.equal(JSON.stringify(playerHand.getAllCardIds()), '[42,7,37,3]');
      assert.equal(JSON.stringify(playerBank.getAllCardIds()), '[19,18,28]');
      assert.equal(turn.getActionCount(), 3);
      assert.equal(turn.getPlayerId(), 1);
      assert.equal(turn.getPhase(), Turn.PHASE_DONE);
    });

  })

}
