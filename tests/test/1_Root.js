const { expect } = require('chai');
const { describe, it } = require('mocha');

const runThisTest = false;

if(runThisTest) {
  const GameFactory = require('../../src/GameFactory');

  const log = (item) => {
    console.log(JSON.stringify(item, null, 2))
  }
  describe("testable thing", () => {

    const gameFactory = new GameFactory();
    const game = gameFactory.buildGame();

    const player1 = game.addPlayer();
    const player2 = game.addPlayer();

    const players = game.getAllPlayers();
    //console.log(players);
    //console.log(game.canStart());

    if(game.canStart()) {

      game.start();
      //console.log(JSON.stringify(game.serialize(), null, 2));

      /*
      const deck = game.makeNewDeck();
      deck.shuffle();
      //*/

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
