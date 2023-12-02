const { assert } = require("chai");
const { describe, it } = require("mocha");

const runThisTest = true;

const Game = require("../../src/Game");
const Card = require("../../src/card/Card");

const {
    findAllCardsOfSet,
    findAllCardsWithTag,
    findAllCardsWithKey,
    clearDeckAndHands,
    dumpPlayerHand,
    dumpCards,
} = require("../../src/utils/cardMethods");

const srcPath = "../../src";

if (runThisTest) {
    describe("Request", () => {});
}

const make3PlayerActionTestGame = () => {
    const game = new Game();
    game.setSeed("test");
    game.setScenario(Game.SCENARIO_PROPERTY_WILD_CASH_ACTION);

    game.addPlayer();
    game.addPlayer();
    game.addPlayer();

    game.start();

    return game;
};

const make3PlayerGame3Contest = () => {
    const game = make3PlayerActionTestGame();
    const player1Id = 1;
    const player2Id = 2;
    const player3Id = 3;

    // Reset to blank game
    clearDeckAndHands(game);

    // currentIndex
    const ci = {
        cash2: 0,
        nope: 0,
    };
    // Find cards
    const birthdayCard = findAllCardsWithKey(game, "BIRTHDAY")[0];
    const cashValue2Cards = findAllCardsWithKey(game, "CASH_2");
    const nopeCards = findAllCardsWithKey(game, "NOPE");

    // Give action cards
    game.getPlayerHand(player1Id).addCard(birthdayCard);
    game.getPlayerHand(player1Id).addCard(nopeCards[ci.nope++]);

    game.getPlayerHand(player2Id).addCard(nopeCards[ci.nope++]);
    game.getPlayerHand(player2Id).addCard(nopeCards[ci.nope++]);

    // Give cash
    game.getPlayerHand(player1Id).addCard(cashValue2Cards[ci.cash2++]);
    game.getPlayerHand(player2Id).addCard(cashValue2Cards[ci.cash2++]);
    game.getPlayerHand(player3Id).addCard(cashValue2Cards[ci.cash2++]);

    return {
        game,
        ci,
        cards: { birthdayCard, cashValue2Cards, nopeCards },
    };
};

describe("Tripple Contest Happy Birthday", () => {
    const player1Id = 1;
    const player2Id = 2;

    const { game, ci, cards } = make3PlayerGame3Contest();

    const player1Hand = game.getPlayerHand(player1Id);
    const player2Hand = game.getPlayerHand(player2Id);

    const player1Birthday = player1Hand.findCard("BIRTHDAY");
    const player2Cash = player2Hand.findCard("CASH_2");

    // Add Cash_2 to bank
    game.getPlayerBank(player2Id).addCard(player2Hand.giveCard(player2Cash));

    const turn = game.getTurn();
    console.log(turn.serialize());

    // Start turn
    game.dealTurnStartingCards();

    // Charge for Birthday presant
    game.chargePlayerValue(player1Birthday.getId(), player2Id);

    const requestManager = game.getRequestManager();

    const player2TargetedBirthdayRequests = requestManager.filterRequests(
        (request) => {
            return request.getTargetId() === player2Id;
        }
    );
    const player2TargetedBirthdayRequestId =
        player2TargetedBirthdayRequests[0].getId();

    const player2NopeFirst = player2Hand.findCard("NOPE");

    //game.payRequest(player2Id, player2TargetedBirthdayRequestId, )

    /*
    
    
    */

    // @TODO
});
