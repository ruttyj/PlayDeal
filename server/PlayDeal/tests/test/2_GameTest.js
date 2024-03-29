const { assert } = require("chai");
const { describe, it } = require("mocha");

const runThisTest = true;

const PlayDealGame = require("../../src/PlayDealGame");
const Turn = require("../../src/turn/Turn");
const Card = require("../../src/card/Card");
const Request = require("../../src/turn/request/Request");
const PropertySet = require("../../src/card/PropertySet");

const {
    findAllCardsOfSet,
    findAllCardsWithTag,
    findAllCardsWithKey,
    clearDeckAndHands,
} = require("../../src/utils/cardMethods");

const dumpCollectionsForPlayerId = (game, playerId = 1) => {
    console.log(
        game
            .getPlayerManager()
            .getCollectionsForPlayerId(playerId)
            .map((c) => c.serialize())
    );
};

const dumpGameState = (game) => {
    console.log(game.serialize());
};

const log = (item) => {
    console.log(JSON.stringify(item));
};

const makeCashOnlyGame = () => {
    const game = new PlayDealGame();
    game.setSeed("test");
    game.setScenario(PlayDealGame.SCENARIO_CASH_ONLY);

    game.addPlayer();
    game.addPlayer();

    game.start();

    return game;
};

const makePropertyOnlyGame = () => {
    const game = new PlayDealGame();
    game.setSeed("test");
    game.setScenario(PlayDealGame.SCENARIO_PROPERTY_ONLY);

    game.addPlayer();
    game.addPlayer();

    game.start();

    return game;
};

const makePropertyPlusWildGame = () => {
    const game = new PlayDealGame();
    game.setSeed("test");
    game.setScenario(PlayDealGame.SCENARIO_PROPERTY_PLUS_WILD);

    game.addPlayer();
    game.addPlayer();

    game.start();

    return game;
};

if (runThisTest) {
    describe("Game Start", () => {
        it("Should deal 5 cards to each player", () => {
            const game = makeCashOnlyGame();
            const deck = game.getDeck();

            const player1Id = 1;
            const player2Id = 2;

            // deck should be shuffled
            const expectedDeckOrder = JSON.stringify([
                16, 7, 9, 18, 15, 5, 17, 6, 1, 3,
            ]);
            assert.equal(
                JSON.stringify(deck.getAllCardIds()),
                expectedDeckOrder
            );

            // Players should have their hands
            const player1Hand = game.getPlayerHand(player1Id);
            const player2Hand = game.getPlayerHand(player2Id);
            assert.equal(
                JSON.stringify(player1Hand.getAllCardIds()),
                "[13,19,4,14,8]"
            );
            assert.equal(
                JSON.stringify(player2Hand.getAllCardIds()),
                "[10,2,12,11,20]"
            );
        });
    });

    describe("Turn and Phase", () => {
        it("Deal turn starting cards", () => {
            const game = makeCashOnlyGame();
            const turnManager = game.getTurnManager();
            const turn = turnManager.getTurn();
            const playerId = turn.getPlayerId();
            const playerManager = game.getPlayerManager();
            const playerHand = playerManager.getPlayerHand(playerId);

            game.dealTurnStartingCards();

            assert.equal(turn.getPlayerId(), 1);
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[13,19,4,14,8,3,1]"
            );
            assert.equal(turn.getPhase(), Turn.PHASE_ACTION);

            // Attempt to be cheekey and draw again
            game.dealTurnStartingCards();
            assert.equal(turn.getPlayerId(), 1);
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[13,19,4,14,8,3,1]"
            );
            assert.equal(turn.getPhase(), Turn.PHASE_ACTION);
        });

        it("When drawing turn starting card should set the turn phase to action", () => {
            const game = makeCashOnlyGame();
            const turnManager = game.getTurnManager();
            const turn = turnManager.getTurn();
            assert.equal(turn.getPlayerId(), 1);
            assert.equal(turn.getPhase(), Turn.PHASE_DRAW);
            game.dealTurnStartingCards();
            assert.equal(turn.getPhase(), Turn.PHASE_ACTION);
        });

        it("Attempt to pass turn when in draw phase should fail", () => {
            const game = makeCashOnlyGame();
            const turnManager = game.getTurnManager();
            turnManager.nextTurn();

            const turn = turnManager.getTurn();
            assert.equal(turn.getPlayerId(), 1);
        });

        it("Attempt to pass turn when in done phase should pass turn to player 2", () => {
            const game = makeCashOnlyGame();
            const turnManager = game.getTurnManager();

            if (1) {
                const turn = turnManager.getTurn();
                game.dealTurnStartingCards();
                // Attempt to pass turn when in action should fail
                turn.nextPhase();
                assert.equal(turn.getPhase(), Turn.PHASE_DONE);
                turnManager.nextTurn();
            }
            if (1) {
                const turn = turnManager.getTurn();
                assert.equal(turn.getPlayerId(), 2);
                assert.equal(turn.getPhase(), Turn.PHASE_DRAW);
            }
        });

        it("Player 1 attempts to pass turn whith 9 cards in hand should end in discard phase", () => {
            const game = makeCashOnlyGame();
            const turnManager = game.getTurnManager();

            // Player 1 passes turn
            if (1) {
                const turn = turnManager.getTurn();
                game.dealTurnStartingCards();
                turn.nextPhase();
                turnManager.nextTurn();
            }

            // Player 2 passes turn
            if (1) {
                const turn = turnManager.getTurn();
                game.dealTurnStartingCards();
                turn.nextPhase();
                turnManager.nextTurn();
            }

            // Player 1 attempts to pass turn whith 9 cards in hand should end in discard phase
            if (1) {
                const turn = turnManager.getTurn();
                game.dealTurnStartingCards();

                turn.nextPhase();
                assert.equal(turn.getPhase(), Turn.PHASE_DISCARD);
            }
        });

        it("Player 1 attempts to pass turn whith 9 cards in hand should end in discard phase", () => {
            const game = makeCashOnlyGame();
            const turnManager = game.getTurnManager();

            // Player 1 passes turn
            if (1) {
                const turn = turnManager.getTurn();
                game.dealTurnStartingCards();
                turn.nextPhase();
                turnManager.nextTurn();
            }

            // Player 2 passes turn
            if (1) {
                const turn = turnManager.getTurn();
                game.dealTurnStartingCards();
                turn.nextPhase();
                turnManager.nextTurn();
            }

            // Player 1 attempts to pass turn whith 9 cards in hand should end in discard phase
            if (1) {
                const turn = turnManager.getTurn();
                game.dealTurnStartingCards();
                turn.nextPhase();
                game.discardCards([13, 19]);
                assert.equal(turn.getPhase(), Turn.PHASE_DONE);
            }
        });

        it("Attempt to end the game", () => {
            const game = makePropertyPlusWildGame();
            const playerManager = game.getPlayerManager();

            // Clear deck - no player will receive cards upon start of turn
            // Clear player hands
            const player1Hand = playerManager.getPlayerHand(1);

            clearDeckAndHands(game);

            const passTurn = () => {
                game.dealTurnStartingCards();
                game.tryToPassTurn();
            };

            // Player 1 - make a green set
            if (1) {
                game.dealTurnStartingCards();
                player1Hand.addCards([3, 4, 5]);
                const collectionId = 1;
                game.playCardToNewCollectionFromHand(3);
                game.playCardToExistingCollectonFromHand(4, collectionId);
                game.playCardToExistingCollectonFromHand(5, collectionId);
                game.tryToPassTurn();
            }

            // Player 2 pass turn
            passTurn();

            // Player 1 - make blue set
            if (1) {
                game.dealTurnStartingCards();
                player1Hand.addCards([1, 2]);
                const collectionId = 2;
                game.playCardToNewCollectionFromHand(1);
                game.playCardToExistingCollectonFromHand(2, collectionId);
                game.tryToPassTurn();
            }

            // Player 2 pass turn
            passTurn();

            // Player 1 - make brown set
            if (1) {
                game.dealTurnStartingCards();
                const collectionId = 3;
                player1Hand.addCards([27, 28]);
                game.playCardToNewCollectionFromHand(27);
                game.playCardToExistingCollectonFromHand(28, collectionId);
            }

            // Game over
            assert.equal(game.getTurn().getPlayerId(), 1);
            assert.equal(game.isGameOver(), true);
            assert.equal(game.getWinner().getId(), 1);

            // should not be able to pass turn after it ended
            game.tryToPassTurn();
            assert.equal(game.getTurn().getPlayerId(), 1);
        });
    });

    describe("Bank", () => {
        it("Place card in bank from hand", () => {
            const game = makeCashOnlyGame();
            const turnManager = game.getTurnManager();
            const turn = turnManager.getTurn();
            const playerId = turn.getPlayerId();
            const playerManager = game.getPlayerManager();

            game.dealTurnStartingCards();

            const playerHand = playerManager.getPlayerHand(playerId);
            const playerBank = playerManager.getPlayerBank(playerId);

            // Action 1
            game.playCardToBankFromHand(19);
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[13,4,14,8,3,1]"
            );
            assert.equal(JSON.stringify(playerBank.getAllCardIds()), "[19]");
            assert.equal(turn.getActionCount(), 1);
            assert.equal(turn.getPhase(), Turn.PHASE_ACTION);

            // Action 2
            game.playCardToBankFromHand(13);
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[4,14,8,3,1]"
            );
            assert.equal(JSON.stringify(playerBank.getAllCardIds()), "[19,13]");
            assert.equal(turn.getActionCount(), 2);
            assert.equal(turn.getPhase(), Turn.PHASE_ACTION);

            // Action 3
            game.playCardToBankFromHand(1);
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[4,14,8,3]"
            );
            assert.equal(
                JSON.stringify(playerBank.getAllCardIds()),
                "[19,13,1]"
            );
            assert.equal(turn.getActionCount(), 3);
            assert.equal(turn.getPhase(), Turn.PHASE_DONE);

            // Attempt to play one more than we have actions for
            game.playCardToBankFromHand(3);
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[4,14,8,3]"
            );
            assert.equal(
                JSON.stringify(playerBank.getAllCardIds()),
                "[19,13,1]"
            );
            assert.equal(turn.getActionCount(), 3);
            assert.equal(turn.getPlayerId(), 1);
            assert.equal(turn.getPhase(), Turn.PHASE_DONE);
        });

        it("Place card in bank from hand", () => {
            const game = new PlayDealGame();
            game.setSeed("test");
            game.setScenario(PlayDealGame.SCENARIO_PROPERTY_CASH);

            game.addPlayer();
            game.addPlayer();

            game.start();
        });
    });

    describe("Plain Collections", () => {
        it("Should be able to create a collection with two cards of the same property set", () => {
            const game = makePropertyOnlyGame();
            const turnManager = game.getTurnManager();
            const playerManager = game.getPlayerManager();

            game.dealTurnStartingCards();
            const turn = turnManager.getTurn();
            const playerId = turn.getPlayerId();
            const playerHand = playerManager.getPlayerHand(playerId);

            // Create new collection
            game.playCardToNewCollectionFromHand(4);
            const collection = game.getCollection(1);
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[25,3,14,22,21,27]"
            );
            assert.equal(JSON.stringify(collection.getAllCardIds()), "[4]");
            assert.equal(collection.getPlayerId(), 1);
            assert.equal(collection.getActiveSet(), "green");

            // Add to existing collection
            game.playCardToExistingCollectonFromHand(3, collection.getId());
            assert.equal(
                JSON.stringify(playerHand.getAllCardIds()),
                "[25,14,22,21,27]"
            );
            assert.equal(JSON.stringify(collection.getAllCardIds()), "[4,3]");
            assert.equal(collection.getActiveSet(), "green");

            assert.equal(turn.getActionCount(), 2);
        });

        it("Transfer from one collection to a new collection", () => {
            const game = makePropertyOnlyGame();

            game.dealTurnStartingCards();

            // Create new collection
            game.playCardToNewCollectionFromHand(4);

            // Transfer to a new collection
            game.transferCardToNewCollectionFromCollection(1, 4);

            // confirm card transfered
            const collectionB = game.getCollection(2);
            assert.equal(JSON.stringify(collectionB.getAllCardIds()), "[4]");

            // confirm old collection deleted
            const collectionA = game.getCollection(1);
            assert.equal(collectionA, null);
        });

        it("Transfer from one collection to a existing collection", () => {
            const game = makePropertyOnlyGame();

            game.dealTurnStartingCards();

            // Create new collection
            game.playCardToNewCollectionFromHand(4);
            game.playCardToExistingCollectonFromHand(3, 1);

            // Transfer to a new collection
            game.transferCardToNewCollectionFromCollection(1, 4);
            game.transferCardToExistingCollectionFromCollection(1, 3, 2);

            // confirm card transfered
            const collectionB = game.getCollection(2);
            assert.equal(JSON.stringify(collectionB.getAllCardIds()), "[4,3]");
            assert.equal(collectionB.getActiveSet(), "green");

            // confirm old collection deleted
            const collectionA = game.getCollection(1);
            assert.equal(collectionA, null);
        });
    });

    describe("Collections with wildcards", () => {
        it("Wild cards should be generated", () => {
            const game = makePropertyPlusWildGame();
            game.dealTurnStartingCards();

            const playerManager = game.getPlayerManager();
            const deck = game.getDeck();
            const player1Hand = playerManager.getPlayerHand(1);
            const player2Hand = playerManager.getPlayerHand(2);

            assert.equal(
                JSON.stringify(deck.getAllCardIds()),
                "[10,1,17,28,31,38,39,30,8,9,35,20,16,34,14,33,11,22,2,23,5,32,27,26,13,21,15]"
            );
            assert.equal(
                JSON.stringify(player1Hand.getAllCardIds()),
                "[18,37,7,3,29,36,12]"
            );
            assert.equal(
                JSON.stringify(player2Hand.getAllCardIds()),
                "[24,19,6,25,4]"
            );
        });

        it("Try to add wrong color to collection", () => {
            const game = makePropertyPlusWildGame();

            game.dealTurnStartingCards();
            game.playCardToNewCollectionFromHand(37);
            const collectionId = 1;
            const collection = game.getCollection(collectionId);
            assert.equal(collection.getActiveSet(), "blue");

            // attempt to add blue >green< wild card
            // should not add to collection
            game.playCardToExistingCollectonFromHand(3, collectionId);
            // should still be only 1 card
            assert.equal(collection.cardCount(), 1);
            // should still be blue
            assert.equal(collection.getActiveSet(), "blue");
        });

        it("A collection with a super wild card should be ambigious", () => {
            const game = makePropertyPlusWildGame();
            game.dealTurnStartingCards();

            // Play ambigious super wild
            game.playCardToNewCollectionFromHand(29);
            const collectionId = 1;
            const collection = game.getCollection(collectionId);
            assert.equal(collection.getActiveSet(), PropertySet.AMBIGIOUS_SET);
        });

        it("Adding a property to a collection only containing a super wild - the collection should take on the active set of the card applied", () => {
            const game = makePropertyPlusWildGame();
            game.dealTurnStartingCards();

            // Play ambigious super wild
            game.playCardToNewCollectionFromHand(29);
            const collectionId = 1;
            const collection = game.getCollection(collectionId);

            game.playCardToExistingCollectonFromHand(3, collectionId);
            assert.equal(collection.getActiveSet(), "green");
        });

        it("Should toggle wild card", () => {
            const game = makePropertyPlusWildGame();
            const playerManager = game.getPlayerManager();
            const player1Hand = playerManager.getPlayerHand(1);
            assert.equal(
                player1Hand.getCard(37).getMeta(Card.COMP_ACTIVE_SET),
                "blue"
            );
            game.toggleWildCardColorInHand(37);
            assert.equal(
                player1Hand.getCard(37).getMeta(Card.COMP_ACTIVE_SET),
                "green"
            );
            game.toggleWildCardColorInHand(37);
            assert.equal(
                player1Hand.getCard(37).getMeta(Card.COMP_ACTIVE_SET),
                "blue"
            );
        });

        it("Should not toggle super wild card", () => {
            const game = makePropertyPlusWildGame();
            const playerManager = game.getPlayerManager();
            const player1Hand = playerManager.getPlayerHand(1);
            assert.equal(
                player1Hand.getCard(29).getMeta(Card.COMP_ACTIVE_SET),
                PropertySet.AMBIGIOUS_SET
            );
            game.toggleWildCardColorInHand(29);
            assert.equal(
                player1Hand.getCard(29).getMeta(Card.COMP_ACTIVE_SET),
                PropertySet.AMBIGIOUS_SET
            );
        });

        it("Switch the set of a Collection containging 1 card should work", () => {
            const game = makePropertyPlusWildGame();
            game.dealTurnStartingCards();

            const cardId = 37;
            game.playCardToNewCollectionFromHand(cardId);

            const collectionId = 1;
            const collection = game.getCollection(collectionId);
            assert.equal(collection.getActiveSet(), "blue");

            game.toggleWildCardColorInCollection(cardId, collectionId);
            assert.equal(collection.getActiveSet(), "green");

            const card = collection.getCard(cardId);
            assert.equal(card.getMeta(Card.COMP_ACTIVE_SET), "green");
        });

        it("Switch the set of a Collection containging 2 cards", () => {
            const game = makePropertyPlusWildGame();
            game.dealTurnStartingCards();

            // create a set with a wildcard
            const cardId = 37;
            game.toggleWildCardColorInHand(cardId);
            game.playCardToNewCollectionFromHand(cardId);
            const collectionId = 1;
            const collection = game.getCollection(collectionId);

            // add green card to collection
            game.playCardToExistingCollectonFromHand(3, collectionId);
            assert.equal(collection.cardCount(), 2);

            // attempt to change the color of the wild card in a set with another card
            game.toggleWildCardColorInCollection(cardId, collectionId);

            // should still be green
            assert.equal(collection.getActiveSet(), "green");
        });

        it("Try to make a full set using a super wild as the last card", () => {
            const game = makePropertyPlusWildGame();
            game.dealTurnStartingCards();

            // Player 1 playes 2 green cards
            game.toggleWildCardColorInHand(37);
            game.playCardToNewCollectionFromHand(37);
            game.playCardToExistingCollectonFromHand(3, 1);
            game.tryToPassTurn();

            // Player 2 passes turn
            game.dealTurnStartingCards();
            game.tryToPassTurn();

            // Player 1 adds super wild to complete the collection
            game.dealTurnStartingCards();
            game.playCardToExistingCollectonFromHand(29, 1);

            const collection = game.getCollection(1);
            assert.equal(collection.isComplete(), true);
            assert.equal(collection.getActiveSet(), "green");
            assert.equal(
                JSON.stringify(collection.getAllCardIds()),
                "[37,3,29]"
            );
        });

        it("Break a full collection to make another", () => {
            const game = makePropertyPlusWildGame();
            game.dealTurnStartingCards();

            // Player 1 playes 2 green cards
            game.toggleWildCardColorInHand(37);
            game.playCardToNewCollectionFromHand(37);
            game.playCardToExistingCollectonFromHand(3, 1);
            game.tryToPassTurn();

            // Player 2 passes turn
            game.dealTurnStartingCards();
            game.tryToPassTurn();

            // Player 1 adds super wild to complete the collection
            game.dealTurnStartingCards();
            game.playCardToExistingCollectonFromHand(29, 1);

            // Transfer super wild to new collection
            game.transferCardToNewCollectionFromCollection(1, 29);
            const collectionGreen = game.getCollection(1);
            assert.equal(collectionGreen.isComplete(), false);

            const collectionSuper = game.getCollection(2);
            assert.equal(collectionGreen.isComplete(), false);
            assert.equal(
                collectionSuper.getActiveSet(),
                PropertySet.AMBIGIOUS_SET
            );

            // Play Brown wildcard to super wild collection
            game.playCardToExistingCollectonFromHand(36, 2);
            assert.equal(collectionSuper.isComplete(), true);
            assert.equal(collectionSuper.getActiveSet(), "brown");
        });
    });

    describe("Requests", () => {
        it("(INCOMPLETE) Should collect all payment paid in cash before turn end", () => {
            // Make game ==============================
            const game = new PlayDealGame();
            game.setSeed("test");
            game.setScenario(PlayDealGame.SCENARIO_PROPERTY_WILD_CASH_ACTION);

            game.addPlayer();
            game.addPlayer();
            game.addPlayer();

            game.start();

            // Setup test case ======================
            const playerManager = game.getPlayerManager();
            const requestManager = game.getRequestManager();

            // Get a cash card id
            const rentCardValue = 2;
            const cash2MillCards = findAllCardsWithKey(
                game,
                `CASH_${rentCardValue}`
            );

            const player1Id = 1;
            const player2Id = 2;
            const player3Id = 3;

            // set up players banks
            const player2CashCard = cash2MillCards[0].getId();
            playerManager.getPlayerBank(player2Id).addCard(player2CashCard); // CASH_2
            const player3CashCard = cash2MillCards[1].getId();
            playerManager.getPlayerBank(player3Id).addCard(player3CashCard); // CASH_2

            // Get birthday card id
            const birthdayCards = findAllCardsWithKey(game, "BIRTHDAY");
            const happyBirthdayCardId = birthdayCards[0].getId();
            playerManager.getPlayerHand(player1Id).addCard(happyBirthdayCardId); // BIRTHDAY

            // First turn ======================================
            game.dealTurnStartingCards();

            // Happy Birthday
            game.chargePlayerValue(happyBirthdayCardId, player2Id);

            // Validate request were created
            const request1Id = 1;
            const request2Id = 2;
            const assertOpenContestableRequest = (request, playerId) => {
                assert.equal(request.getType(), Request.TYPE_REQUEST_VALUE);
                assert.equal(
                    request.getValue(),
                    rentCardValue,
                    "Value should be as expected"
                );
                assert.equal(
                    request.getTargetId(),
                    playerId,
                    "Target player should be as expected"
                );
                assert.equal(
                    request.getAuthorId(),
                    player1Id,
                    "Author should be as expected"
                );
                assert.equal(
                    request.isContestable(),
                    true,
                    "should be contestable"
                );
                assert.equal(
                    request.getStatus(),
                    Request.STATUS_REQUESTING,
                    "Status should be requesting"
                );
            };
            assertOpenContestableRequest(
                requestManager.getRequest(request1Id),
                player2Id
            );
            assertOpenContestableRequest(
                requestManager.getRequest(request2Id),
                player3Id
            );

            /*
            requestManager.acceptRequest(requiestId, {
              actionCardIds: [],
              bankCardIds: [],
              propertyCardIds: [],
              collectionIds: [],
            });
            
            requestManager.contestRequest({
              actionCardIds
            })

            */

            /*
            // Players pays request
            game.payRequest(player2Id, request1Id, [player2CashCard]);
            game.payRequest(player3Id, request2Id, [player3CashCard]);

            // Check if requests are satisfied
            const assertPayedInFull = (requestId) => {
                const request = requestManager.getRequest(requestId);
                assert.equal(
                    request.isSatisfied(),
                    true,
                    `request ${requestId} should be satisfied`
                );
            };

            // both requests should be satisfied
            assertPayedInFull(request1Id);
            assertPayedInFull(request2Id);

            game.tryToPassTurn();
            assert.equal(
                game.getTurn().getPlayerId(),
                player2Id,
                `should be player ${player2Id} turn`
            );
            */
        });
    });

    /*
    //console.log(JSON.stringify(requestManager.getRequestsByPlayerId(player1Id).map(r => r.serialize()), null, 2));
    //console.log(JSON.stringify(requestManager.serialize(), null, 2));
    
    //game.tryToPassTurn();
    //console.log('------------');
    //console.log(findAllCardsWithKey(game, 'SUPER_RENT'));
    //console.log(findAllCardsOfSet(game, 'blue'));
    //console.log(findAllCardsWithTag(game, Card.TAG_REQUEST));
    //dumpAllPlayers(game);

    const playerId = 1;
    dumpPlayerHand(game, playerId);
    dumpCollectionsForPlayerId(game, playerId);

    console.log(findAllCardsOfSet(game, 'green'));
    dumpAllPlayers(game);
  //*/
}
