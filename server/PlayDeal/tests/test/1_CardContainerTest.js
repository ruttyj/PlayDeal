const { assert } = require("chai");
const { describe, it } = require("mocha");

const runThisTest = false;

const srcPath = "../../src";
const CardManager = require(srcPath + "/card/CardManager");
const CardContainer = require(srcPath + "/card/CardContainer");
const RandomNumberGen = require(srcPath + "/utils/RandomNumberGen");

if (runThisTest) {
    // Init Card Manager
    const cardManager = new CardManager();
    cardManager.setup(CardManager.SCENARIO_CASH_ONLY);

    // Init Random number generator
    const rng = new RandomNumberGen();
    rng.setSeed("test");

    // Create starting scenarios
    const makeNewCardContainer = () => {
        return new CardContainer(cardManager);
    };

    describe("CardContainer", () => {
        it("serialize() should return empty array when empty", () => {
            const cardContainer = makeNewCardContainer();
            assert.equal(JSON.stringify(cardContainer.serialize()), "[]");
        });

        it("addCard(cardId) should add card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCard(1);
            assert.equal(JSON.stringify(cardContainer.serialize()), "[1]");
        });

        it("addCard(card) should add card", () => {
            const cardContainer = makeNewCardContainer();
            const card = cardManager.getCard(1);
            cardContainer.addCard(card);
            assert.equal(JSON.stringify(cardContainer.serialize()), "[1]");
        });

        it("addCard(junk) should not add card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCard(34556456456);
            assert.equal(JSON.stringify(cardContainer.serialize()), "[]");
        });

        it("addCards(cards) should add multiple cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());
            assert.equal(
                JSON.stringify(cardContainer.serialize()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("hasCard(cardId) should have card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());
            assert.equal(cardContainer.hasCard(1), true);
        });

        it("hasCard(card) should have card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());
            const card = cardManager.getCard(1);

            assert.equal(cardContainer.hasCard(card), true);
        });

        it("hasCard(junkId) should not have card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());
            assert.equal(cardContainer.hasCard(476456), false);
        });

        it("getAllCardIds() should return all ids", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("getAllCards() should return all cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.getAllCards();
            let result = cards.map((card) => card.getId());

            assert.equal(
                JSON.stringify(result),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("getCards(cardIds) should return cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.getCards([4, 5, 6]);

            let result = [];
            cards.forEach((card) => {
                result.push(card.getId());
            });

            assert.equal(JSON.stringify(result), "[4,5,6]");
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("getCards(cards) should return cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.getCards([
                cardManager.getCard(4),
                cardManager.getCard(5),
                cardManager.getCard(6),
            ]);

            let result = [];
            cards.forEach((card) => {
                result.push(card.getId());
            });

            assert.equal(JSON.stringify(result), "[4,5,6]");
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("count() should return count", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            assert.equal(cardContainer.count(), 20);
        });

        it("removeCard(cardId) should remove card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());
            cardContainer.removeCard(12);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20]"
            );
        });

        it("removeCard(card) should remove card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());
            cardContainer.removeCard(cardManager.getCard(12));
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20]"
            );
        });

        it("getCard(cardId) should return card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const card = cardContainer.getCard(12);
            assert.equal(card.getId(), 12);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("getCard(card) should return card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const card = cardContainer.getCard(cardManager.getCard(12));
            assert.equal(card.getId(), 12);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("getCards(cardIds) should return cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.getCards([12, 13]);
            assert.equal(cards.length, 2);
            assert.equal(
                JSON.stringify(cards.map((card) => card.getId())),
                "[12,13]"
            );
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("getCards(cards) should return cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.getCards([
                cardManager.getCard(12),
                cardManager.getCard(13),
            ]);
            assert.equal(cards.length, 2);
            assert.equal(
                JSON.stringify(cards.map((card) => card.getId())),
                "[12,13]"
            );
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("giveCard(cardId) should return card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const card = cardContainer.giveCard(12);
            assert.equal(card.getId(), 12);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20]"
            );
        });

        it("giveCard(card) should return card", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const card = cardContainer.giveCard(cardManager.getCard(12));
            assert.equal(card.getId(), 12);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20]"
            );
        });

        it("giveCards(cardIds) should return cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.giveCards([12, 13]);
            assert.equal(cards.length, 2);
            assert.equal(
                JSON.stringify(cards.map((card) => card.getId())),
                "[12,13]"
            );
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,14,15,16,17,18,19,20]"
            );
        });

        it("giveCards(cards) should return cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.giveCards([
                cardManager.getCard(12),
                cardManager.getCard(13),
            ]);
            assert.equal(cards.length, 2);
            assert.equal(
                JSON.stringify(cards.map((card) => card.getId())),
                "[12,13]"
            );
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,14,15,16,17,18,19,20]"
            );
        });

        it("getBottomCards() should return bottom cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.getBottomCards(2);
            assert.equal(cards.length, 2);
            assert.equal(
                JSON.stringify(cards.map((card) => card.getId())),
                "[1,2]"
            );
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("getBottomCards() should return top cards", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const cards = cardContainer.getTopCards(2);
            assert.equal(cards.length, 2);
            assert.equal(
                JSON.stringify(cards.map((card) => card.getId())),
                "[20,19]"
            );
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });

        it("pop() should pop", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());

            const card = cardContainer.pop();
            assert.equal(card.getId(), 20);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]"
            );
        });

        it("shuffle() should shuffle", () => {
            const cardContainer = makeNewCardContainer();
            cardContainer.addCards(cardManager.getAllCards());
            cardContainer.shuffle(rng);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[16,7,9,18,15,5,17,6,1,3,20,8,11,14,12,4,2,19,10,13]"
            );
        });

        it("unserialize() should restore data", () => {
            const dummyContainer = makeNewCardContainer();
            dummyContainer.addCards(cardManager.getAllCards());
            const serialized = dummyContainer.serialize();

            const cardContainer = makeNewCardContainer();
            cardContainer.unserialize(serialized);
            assert.equal(
                JSON.stringify(cardContainer.getAllCardIds()),
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
            );
        });
    });
}
