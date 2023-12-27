const { assert } = require("chai");
const { describe, it } = require("mocha");

const runThisTest = true;

const PlayDealGame = require("../../src/PlayDealGame");
const Card = require("../../src/card/Card");
const SelectionContext = require("../../src/card/SelectionContext");
const Request = require("../../src/turn/request/Request");

const {
    findAllCardsOfSet,
    findAllCardsWithTag,
    findAllCardsWithKey,
    clearDeckAndHands,
    dumpPlayerHand,
    dumpRequests,
    dumpCards,
} = require("../../src/utils/cardMethods");

const srcPath = "../../src";

if (runThisTest) {
    describe("Request", () => {});
}

const make3PlayerActionTestGame = () => {
    const game = new PlayDealGame();
    game.setSeed("test");
    game.setScenario(PlayDealGame.SCENARIO_PROPERTY_WILD_CASH_ACTION);

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

describe("Requests", () => {
    it("Tripple Contest Happy Birthday", () => {
        const { game } = make3PlayerGame3Contest();
        const requestManager = game.getRequestManager();
        const turn = game.getTurn();

        const player1Id = 1;
        const player2Id = 2;

        const player1Hand = game.getPlayerHand(player1Id);
        const player2Hand = game.getPlayerHand(player2Id);

        // Add Cash_2 to bank
        const player2Cash = player2Hand.findCard("CASH_2");
        game.getPlayerBank(player2Id).addCard(
            player2Hand.giveCard(player2Cash)
        );

        // Start turn
        game.dealTurnStartingCards();

        // Charge for Birthday presant
        const player1Birthday = player1Hand.findCard("BIRTHDAY");
        game.chargePlayerValue(player1Birthday.getId(), player2Id);

        // Handle player 2 request
        const p2BdayRequest = requestManager.findRequest((request) => {
            return request.getTargetId() === player2Id;
        });
        const player2TargetedBirthdayRequestId = p2BdayRequest.getId();
        const player2FirstNopeCard = player2Hand.findCard("NOPE");
        const player2FirstNopeSelectionContext = game
            .makeSelectionContext()
            .addSelection(SelectionContext.TYPE_ACTION, player2FirstNopeCard);
        game.contestRequest(
            player2Id,
            player2TargetedBirthdayRequestId,
            player2FirstNopeSelectionContext
        );

        // should be contested
        assert.equal(p2BdayRequest.getStatus(), Request.STATUS_CONTESTED);

        // nope request must be open
        const p2NopeCounterRequest = requestManager.findRequest((request) => {
            return (
                request.getAuthorId() === player2Id &&
                request.getTargetId() === player1Id
            );
        });
        assert.equal(
            p2NopeCounterRequest.getStatus(),
            Request.STATUS_REQUESTING
        );

        game.contestRequest(
            player1Id,
            p2NopeCounterRequest.getId(),
            game
                .makeSelectionContext()
                .addSelection(
                    SelectionContext.TYPE_ACTION,
                    player1Hand.findCard("NOPE")
                )
        );
        // first nope must be contested
        assert.equal(
            p2NopeCounterRequest.getStatus(),
            Request.STATUS_CONTESTED
        );

        const request2ndNopeId = 4;
        const request2ndNope = requestManager.getRequest(request2ndNopeId);
        assert.equal(request2ndNope.getStatus(), Request.STATUS_REQUESTING);
        assert.equal(
            request2ndNope.getTargetRequestId(),
            p2NopeCounterRequest.getId()
        );

        const trippleNopeRequest = game.contestRequest(
            player2Id,
            request2ndNopeId,
            game
                .makeSelectionContext()
                .addSelection(
                    SelectionContext.TYPE_ACTION,
                    player2Hand.findCard("NOPE")
                )
        );
        const trippleNopeRequestId = trippleNopeRequest.getId();
        assert.equal(request2ndNope.getStatus(), Request.STATUS_CONTESTED);
        assert.equal(trippleNopeRequest.getStatus(), Request.STATUS_REQUESTING);

        // Accept the most recent nope
        game.acceptRequest(player1Id, trippleNopeRequestId);
        assert.equal(
            requestManager.getRequest(5).getStatus(),
            Request.STATUS_ACCEPTED
        );
        assert.equal(
            requestManager.getRequest(4).getStatus(),
            Request.STATUS_DECLINED
        );
        assert.equal(
            requestManager.getRequest(3).getStatus(),
            Request.STATUS_ACCEPTED
        );
        assert.equal(
            requestManager.getRequest(1).getStatus(),
            Request.STATUS_DECLINED
        );

        [5, 4, 3, 1].forEach((requestId) => {
            const request = requestManager.getRequest(requestId);
            assert.equal(request.isSatisfied(), true);
            assert.equal(request.isClosed(), true);
        });
    });

    it("Accept Happy Birthday", () => {
        const { game } = make3PlayerGame3Contest();
        const requestManager = game.getRequestManager();
        const turn = game.getTurn();

        const player1Id = 1;
        const player2Id = 2;

        const player1Hand = game.getPlayerHand(player1Id);
        const player2Hand = game.getPlayerHand(player2Id);

        // Add Cash_2 to bank
        const player2Cash = player2Hand.findCard("CASH_2");
        const player2Bank = game.getPlayerBank(player2Id);
        player2Bank.addCard(player2Hand.giveCard(player2Cash));

        // Start turn
        game.dealTurnStartingCards();

        // Charge for Birthday presant
        const player1Birthday = player1Hand.findCard("BIRTHDAY");
        game.chargePlayerValue(player1Birthday.getId(), player2Id);

        // Handle player 2 request
        const p2BdayRequest = requestManager.findRequest((request) => {
            return request.getTargetId() === player2Id;
        });
        const player2TargetedBirthdayRequestId = p2BdayRequest.getId();
        game.acceptRequest(
            player2Id,
            player2TargetedBirthdayRequestId,
            game
                .makeSelectionContext()
                .addSelection(SelectionContext.TYPE_BANK, player2Cash)
        );

        dumpRequests(game);

        /*// @TODO

          */
    });
});
