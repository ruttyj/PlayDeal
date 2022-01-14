const { assert } = require('chai');
const { describe, it } = require('mocha');

const Game = require('../../src/Game');

const runThisTest = true;

const makeCashOnlyGame = () => {
  const game = new Game();
  game.setSeed('test');
  game.setScenario(Game.SCENARIO_CASH_ONLY);

  game.addPlayer();
  game.addPlayer();

  return game;
}
      
if(runThisTest) {

  const log = (item) => {
    console.log(JSON.stringify(item))
  }
  describe("testable thing", () => {

    it('Should deal 5 cards each', () => {
      const game = makeCashOnlyGame();

      const player1 = game.getPlayer(1);
      const player2 = game.getPlayer(2);
  
      const player1Id = player1.getId();
      const player2Id = player2.getId();

      game.start();


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
      assert.equal(JSON.stringify(player1Hand.serialize()), '[42,19,18,7,28]');
      assert.equal(JSON.stringify(player2Hand.serialize()), '[26,21,44,5,17]');
    
    
    })
    

    /*
    
    game.canStart()
    game.isInProgress()
    game.hasEnded()

    game.start();

    const turn = game.getCurrentTurn()

    turn.getPerson();


    //*/

    /*
    it('Client 2 disconnects', () => {
      const c3Log = new Map();
      
      const c3People = c3Log.get('room_people_all_keyed');

      client2.emit('disconnect');
      expect(c3People.items['3'].type).to.equal('host');
      expect(c3People.order.length).to.equal(1);
    })
    //*/
  })

}
