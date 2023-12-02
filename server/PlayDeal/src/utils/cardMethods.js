const Card = require("../card/Card");

const findAllCardsOfSet = (game, propertySet) => {
    const cardManager = game.getCardManager();
    return cardManager.findCards((card) => {
        if (card.hasMeta(Card.COMP_ACTIVE_SET)) {
            const activeSet = card.getMeta(Card.COMP_ACTIVE_SET);
            return activeSet === propertySet;
        }
    });
};

const findAllCardsWithTag = (game, tag) => {
    const cardManager = game.getCardManager();
    return cardManager.findCards((card) => {
        return card.hasTag(tag);
    });
};

const findAllCardsWithKey = (game, key) => {
    const cardManager = game.getCardManager();
    return cardManager.findCards((card) => {
        return card.getKey() === key;
    });
};

const clearDeckAndHands = (game) => {
    const playerManager = game.getPlayerManager();
    // Clear deck - no player will receive cards upon start of turn
    const deck = game.getDeck();
    deck.replaceAllCards([]);

    playerManager.getAllPlayerIds().forEach((playerId) => {
        const playerHand = playerManager.getPlayerHand(playerId);
        playerHand.replaceAllCards([]);
    });
};

const dumpAllPlayers = (game) => {
    const playerManager = game.getPlayerManager();

    playerManager.getAllPlayerIds().forEach((playerId) => {
        console.log(`Player ${playerId} -----------------`);

        console.log("Hand");
        dumpPlayerHand(game, playerId);

        console.log("Bank");
        dumpPlayerBank(game, playerId);

        console.log("Collections");
        dumpCollectionsForPlayerId(game, playerId);
    });
};

const dumpPlayerHand = (game, playerId = 1) => {
    console.log(
        game
            .getPlayerManager()
            .getPlayerHand(playerId)
            .getAllCards()
            .map((c) => c.serialize())
    );
};

const dumpPlayerBank = (game, playerId = 1) => {
    console.log(
        game
            .getPlayerManager()
            .getPlayerBank(playerId)
            .getAllCards()
            .map((c) => c.serialize())
    );
};

const dumpCards = (game, cards) => {
    console.log(cards.map((c) => c.serialize()));
};

const dumpCollection = (game, playerId = 1) => {
    console.log(game.getCollection(playerId).serialize());
};

module.exports = {
    findAllCardsOfSet,
    findAllCardsWithTag,
    findAllCardsWithKey,
    clearDeckAndHands,
    dumpAllPlayers,

    dumpPlayerHand,
    dumpPlayerBank,
    dumpCollection,

    dumpCards,
};
