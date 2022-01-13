const { assert } = require('chai');
const { describe, it } = require('mocha');

const Game = require('../../src/Game');
const GameFactory = require('../../src/GameFactory');

const runThisTest = true;

if(runThisTest) {

  const log = (item) => {
    console.log(JSON.stringify(item, null, 2))
  }
  describe("testable thing", () => {

    const gameFactory = new GameFactory();
    const game = gameFactory.buildGame();
    game.setSeed('test');
    game.setScenario(Game.SCENARIO_DEFAULT);

    const player1 = game.addPlayer();
    const player2 = game.addPlayer();

    if(game.canStart()) {
      game.start();

      const deck = game.getDeck();
      console.log(deck.getAllCardIds());

      //console.log(JSON.stringify(game.serialize(), null, 2));

      /*
      if(game.isPlayerTurn(player)){
        const card = game.drawCardFromDeck();
      }
      */
    }

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
