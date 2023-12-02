const PlayerManager = require("../src/player/PlayerManager");
const CardManager = require("../src/card/CardManager");
const TurnManager = require("../src/turn/TurnManager");
const RandomNumberGen = require("../src/utils/RandomNumberGen");
const CardContainer = require("../src/card/CardContainer");
const CardSelection = require("../src/card/CardSelection");
const Turn = require("../src/turn/Turn");
const Card = require("../src/card/Card");
const PropertySet = require("../src/card/PropertySet");
const Request = require("./turn/request/Request");
const RequestValue = require("./turn/request/requestTypes/RequestValue");
const RequestRent = require("./turn/request/requestTypes/RequestRent");
const WealthTransfer = require("./turn/request/WealthTransfer");
const Transfer = require("./turn/request/Transfer");
/**
 * =====================================================
 *
 *                        PlayDeal
 *
 * =====================================================
 */
module.exports = class Game {
    static SCENARIO_CASH_ONLY = "cashOnly";
    static SCENARIO_PROPERTY_ONLY = "propertyOnly";
    static SCENARIO_PROPERTY_PLUS_WILD = "propertyPlusWild";
    static SCENARIO_PROPERTY_CASH = "propertyCash";
    static SCENARIO_PROPERTY_WILD_CASH_ACTION = "propertyWildCashAction";
    static SCENARIO_DEFAULT = "default";

    constructor() {
        this._cardManager = new CardManager();
        this._playerManager = new PlayerManager(this._cardManager);
        this._turnManager = new TurnManager(this);
        this._rng = new RandomNumberGen(); // keep random numbers reproducable

        this._deck = new CardContainer(this._cardManager);
        this._activePile = new CardContainer(this._cardManager);
        this._discardPile = new CardContainer(this._cardManager);

        this._scenario = Game.SCENARIO_DEFAULT;
        this._minPlayerLimit = 2; // min players to start a game
        this._gameStartingCardCount = 5; // cards given to player at beginning of game
        this._turnStartingCardCount = 2; // number of cards to be collected on turn start
        this._maxCardsInHand = 7; // max cards in hand at end of turn

        this._winner = null;
        this._hasStarted = false;
        this._hasEnded = false;
    }

    getPlayerManager() {
        return this._playerManager;
    }

    getTurnManager() {
        return this._turnManager;
    }

    getRequestManager() {
        return this.getTurn().getRequestManager();
    }

    getRequest(requestId) {
        this.getRequestManager().getRequest(requestId);
    }

    //===============================================

    //                    RNG SEED

    //===============================================
    setSeed(seed) {
        this._rng.setSeed(seed);
    }

    getSeed() {
        return this._rng.getSeed();
    }

    setScenario(scenario) {
        this._scenario = scenario;
    }

    getScenario() {
        return this._scenario;
    }

    //===============================================

    //                    PLAYERS

    //===============================================
    addPlayer() {
        if (!this._hasStarted) {
            return this._playerManager.addPlayer();
        }
    }

    getPlayer(playerId) {
        return this._playerManager.getPlayer(playerId);
    }

    getPlayerHand(playerId) {
        return this._playerManager.getPlayerHand(playerId);
    }

    getPlayerBank(playerId) {
        return this._playerManager.getPlayerBank(playerId);
    }

    getAllPlayers() {
        return this._playerManager.getAll();
    }

    getPlayerCount() {
        return this._playerManager.getPlayerCount();
    }

    //===============================================

    //                    CONFIGS

    //===============================================
    getMaxCardsInHand() {
        return this._maxCardsInHand;
    }

    //===============================================

    //                  CARD MANAGER

    //===============================================
    _initCardManager() {
        let cardLoadout;

        switch (this._scenario) {
            // CASH
            case Game.SCENARIO_CASH_ONLY:
                cardLoadout = CardManager.SCENARIO_CASH_ONLY;
                break;

            // PROPERTY + CASH
            case Game.SCENARIO_PROPERTY_CASH:
                cardLoadout = CardManager.SCENARIO_PROPERTY_CASH;
                break;

            // PROPERTY
            case Game.SCENARIO_PROPERTY_ONLY:
                cardLoadout = CardManager.SCENARIO_PROPERTY_ONLY;
                break;

            // PROPERTY + WILD
            case Game.SCENARIO_PROPERTY_PLUS_WILD:
                cardLoadout = CardManager.SCENARIO_PROPERTY_PLUS_WILD;
                break;

            // PROPERTY + WILD + CASH + ACTION
            case Game.SCENARIO_PROPERTY_WILD_CASH_ACTION:
                cardLoadout = CardManager.SCENARIO_PROPERTY_WILD_CASH_ACTION;
                break;

            case Game.SCENARIO_DEFAULT:
            default:
                cardLoadout = CardManager.SCENARIO_DEFAULT;
        }

        this._cardManager.setup(cardLoadout);
    }

    getCardManager() {
        return this._cardManager;
    }

    getCollection(collectionId) {
        // yes this is a bit of a streach, to be refactored
        return this._playerManager.getCollection(collectionId);
    }

    getPropertySet(propertySetId) {
        return this._cardManager.getPropertySet(propertySetId);
    }

    //===============================================

    //                DECK / PILES

    //===============================================
    _generateDeck() {
        const cards = this._cardManager.getAllCards();
        this._deck.addCards(cards);
        this._deck.shuffle(this._rng);
    }

    getDeck() {
        return this._deck;
    }

    getActivePile() {
        return this._activePile;
    }

    getDiscardPile() {
        return this._discardPile;
    }

    _recycleCards() {
        const activePile = this.getActivePile();
        const discardPile = this.getDiscardPile();
        const deck = this.getDeck();

        deck.addCards(activePile.giveCards(activePile.getAllCardIds()));
        deck.addCards(discardPile.giveCards(discardPile.getAllCardIds()));
        deck.shuffle(this._rng);
    }

    _drawCardFromDeck() {
        const deck = this.getDeck();
        if (deck.count() === 0) {
            this._recycleCards();
        }
        return deck.pop();
    }

    _drawCardForPlayer(playerId) {
        const hand = this._playerManager.getPlayerHand(playerId);
        const card = this._drawCardFromDeck();
        hand.addCard(card);
    }

    _dealInitialCards() {
        for (let i = 0; i < this._gameStartingCardCount; ++i) {
            this._playerManager.iterate((player) => {
                this._drawCardForPlayer(player.getId());
            });
        }
    }

    //===============================================

    //             COLLECTION OVERHEAD

    //===============================================
    // @TODO refactor

    _cleanUpCollection(collectionId) {
        const playerManager = this._playerManager;
        const collection = playerManager.getCollection(collectionId);

        // @TODO check for setAugments move to empty set if nessary

        if (collection.cardCount() === 0) {
            playerManager.deleteCollection(collectionId);
        }
    }

    _canAddCardToCollection(cardId, collectionId) {
        const playerManager = this._playerManager;
        const cardManager = this._cardManager;

        const card = cardManager.getCard(cardId);
        const collection = playerManager.getCollection(collectionId);

        if (
            card.hasTag(Card.TAG_PROPERTY) ||
            card.hasTag(Card.TAG_WILD_PROPERTY)
        ) {
            const cardActiveSet = card.getMeta(Card.COMP_ACTIVE_SET);
            const isSuperWild = card.hasTag(Card.TAG_SUPERWILD_PROPERTY);
            if (
                isSuperWild ||
                [null, PropertySet.AMBIGIOUS_SET, cardActiveSet].includes(
                    collection.getActiveSet()
                )
            ) {
                return true;
            }
        } else if (card.hasTag(Card.TAG_SET_AUGMENT)) {
            // @TODO
        }
    }

    // makes sure the card and collection are the same property set
    _updateCollectionAndCard(collectionId, cardId) {
        const game = this;
        const playerManager = game.getPlayerManager();
        const collection = playerManager.getCollection(collectionId);

        // Check if win condition
        const playerId = collection.getPlayerId();
        if (game._checkDoesPlayerWin(playerId)) {
            game._onPlayerWin(playerId);
        }
    }

    //===============================================

    //                  LIFE CYCLE

    //===============================================
    getTurn() {
        return this._turnManager.getTurn();
    }

    canStart() {
        return (
            !this._hasStarted &&
            !this._hasEnded &&
            this._hasEnoughPeopleToStart()
        );
    }

    _hasEnoughPeopleToStart() {
        return this._minPlayerLimit <= this.getPlayerCount();
    }

    start() {
        // Setup managers
        this._initCardManager();
        this._playerManager.setup();
        this._turnManager.setup();

        this._generateDeck();

        this._hasStarted = true;

        // Give out cards to players
        this._dealInitialCards();
    }

    _checkDoesPlayerWin(playerId) {
        const playerManager = this._playerManager;
        let fullCollectionKeys = new Map();
        playerManager
            .getCollectionsForPlayerId(playerId)
            .forEach((collection) => {
                if (collection.isComplete()) {
                    fullCollectionKeys.set(collection.getActiveSet(), true);
                }
            });

        return fullCollectionKeys.size >= 3;
    }

    _onPlayerWin(playerId) {
        this._hasEnded = true;
        this._winner = playerId;
    }

    isGameOver() {
        return this._hasEnded;
    }

    getWinner() {
        if (this._winner) {
            return this._playerManager.getPlayer(this._winner);
        }
        return null;
    }

    //===============================================

    //                TURN / PHASE

    //===============================================

    dealTurnStartingCards() {
        const turn = this._turnManager.getTurn();
        if (turn.getPhase() === Turn.PHASE_DRAW) {
            for (let i = 0; i < this._turnStartingCardCount; ++i) {
                this._drawCardForPlayer(turn.getPlayerId());
            }
            turn.addTag(Turn.TAG_CARDS_DRAWN);
            turn.nextPhase();
        }
    }

    discardCards(cardIds) {
        const turn = this._turnManager.getTurn();
        const playerId = turn.getPlayerId();
        const playerHand = this._playerManager.getPlayerHand(playerId);

        if (turn.getPhase() === Turn.PHASE_DISCARD) {
            const maxIterations = Math.min(
                cardIds.length,
                turn.getCountCardsTooMany()
            );
            for (let i = 0; i < maxIterations; ++i) {
                const cardId = cardIds[i];
                if (playerHand.hasCard(cardId)) {
                    this._discardPile.addCard(playerHand.giveCard(cardId));
                }
            }

            if (!turn.shouldDiscardCards()) {
                turn.nextPhase();
            }
        }
    }

    tryToPassTurn() {
        const turnManager = this._turnManager;
        const turn = turnManager.getTurn();
        turn.nextPhase();

        if (turn.getPhase() === Turn.PHASE_DONE) {
            turnManager.nextTurn();
        }
    }

    //===============================================

    //            PLAY CARD FROM HAND

    //===============================================

    playCardToBankFromHand(cardId) {
        const turn = this._turnManager.getTurn();
        if (turn.isWithinActionLimit()) {
            const playerManager = this._playerManager;
            const playerId = turn.getPlayerId();
            const playerHand = playerManager.getPlayerHand(playerId);
            const playerBank = playerManager.getPlayerBank(playerId);
            if (
                playerHand.hasCard(cardId) &&
                playerHand.getCard(cardId).hasTag(Card.TAG_BANKABLE)
            ) {
                playerBank.addCard(playerHand.giveCard(cardId));
                turn.consumeAction();
            }
        }
    }

    playCardToNewCollectionFromHand(cardId) {
        const turn = this._turnManager.getTurn();
        if (
            turn.getPhase() === Turn.PHASE_ACTION &&
            turn.isWithinActionLimit()
        ) {
            const playerManager = this._playerManager;
            const playerId = turn.getPlayerId();
            const playerHand = playerManager.getPlayerHand(playerId);

            if (playerHand.hasCard(cardId)) {
                const newCollection =
                    playerManager.makeNewCollectionForPlayer(playerId);
                newCollection.addCard(playerHand.giveCard(cardId));
                this._updateCollectionAndCard(newCollection.getId(), cardId);
                turn.consumeAction();
            }
        }
    }

    playCardToExistingCollectonFromHand(cardId, collectionId) {
        const turn = this._turnManager.getTurn();
        if (
            turn.getPhase() === Turn.PHASE_ACTION &&
            turn.isWithinActionLimit()
        ) {
            const playerManager = this._playerManager;
            const playerId = turn.getPlayerId();
            const playerHand = playerManager.getPlayerHand(playerId);

            if (playerHand.hasCard(cardId)) {
                const collection = playerManager.getCollection(collectionId);
                if (collection && collection.getPlayerId() === playerId) {
                    if (this._canAddCardToCollection(cardId, collectionId)) {
                        collection.addCard(playerHand.giveCard(cardId));
                        this._updateCollectionAndCard(
                            collection.getId(),
                            cardId
                        );
                        turn.consumeAction();
                    }
                }
            }
        }
    }

    //===============================================

    //         TRANSFER BETWEEN COLLECTIONS

    //===============================================

    transferCardToNewCollectionFromCollection(collectionId, cardId) {
        const playerManager = this._playerManager;
        const turn = this._turnManager.getTurn();
        const playerId = turn.getPlayerId();

        const collection = playerManager.getCollection(collectionId);
        if (turn.getPhase() === Turn.PHASE_ACTION) {
            if (
                collection.hasCard(cardId) &&
                collection.getPlayerId() === playerId
            ) {
                const newCollection =
                    playerManager.makeNewCollectionForPlayer(playerId);
                newCollection.addCard(collection.giveCard(cardId));
                this._updateCollectionAndCard(newCollection.getId(), cardId);
                this._cleanUpCollection(collectionId);
            }
        }
    }

    transferCardToExistingCollectionFromCollection(
        collectionAId,
        cardId,
        collectionBId
    ) {
        const playerManager = this._playerManager;
        const turn = this._turnManager.getTurn();
        const playerId = turn.getPlayerId();

        const collectionA = playerManager.getCollection(collectionAId);
        if (turn.getPhase() === Turn.PHASE_ACTION) {
            if (
                collectionA &&
                collectionA.hasCard(cardId) &&
                collectionA.getPlayerId() === playerId
            ) {
                const collectionB = playerManager.getCollection(collectionBId);

                if (collectionB.getPlayerId() === playerId) {
                    if (
                        this._canAddCardToCollection(
                            cardId,
                            collectionB.getId()
                        )
                    ) {
                        collectionB.addCard(collectionA.giveCard(cardId));
                        this._updateCollectionAndCard(collectionBId, cardId);
                        this._cleanUpCollection(collectionAId);
                    }
                }
            }
        }
    }

    //===============================================

    //              TOGGLE WILDCARDS

    //===============================================

    toggleWildCardColorInCollection(cardId, collectionId) {
        const turn = this.getTurn();
        const playerManager = this._playerManager;
        const playerId = turn.getPlayerId();

        const collection = playerManager.getCollection(collectionId);
        if (
            collection &&
            collection.getPlayerId() === playerId &&
            collection.hasCard(cardId) &&
            collection.cardCount() === 1
        ) {
            const card = collection.getCard(cardId);
            const cardActiveSet = card.getMeta(Card.COMP_ACTIVE_SET);
            const availableSets = card.getMeta(Card.COMP_AVAILABLE_SETS);

            let activeIndex = availableSets.findIndex(
                (set) => set === cardActiveSet
            );
            const newActiveSet =
                availableSets[(activeIndex + 1) % availableSets.length];
            card.addMeta(Card.COMP_ACTIVE_SET, newActiveSet);
            collection.setActiveSet(newActiveSet);
        }
    }

    toggleWildCardColorInHand(cardId) {
        const turn = this.getTurn();
        const playerManager = this._playerManager;
        const playerId = turn.getPlayerId();
        const playerHand = playerManager.getPlayerHand(playerId);

        if (playerHand.hasCard(cardId)) {
            const card = playerHand.getCard(cardId);
            if (
                card.hasTag(Card.TAG_WILD_PROPERTY) &&
                !card.hasTag(Card.TAG_SUPERWILD_PROPERTY)
            ) {
                const cardActiveSet = card.getMeta(Card.COMP_ACTIVE_SET);
                const availableSets = card.getMeta(Card.COMP_AVAILABLE_SETS);

                let activeIndex = availableSets.findIndex(
                    (set) => set === cardActiveSet
                );
                const newActiveSet =
                    availableSets[(activeIndex + 1) % availableSets.length];
                card.addMeta(Card.COMP_ACTIVE_SET, newActiveSet);
            }
        }
    }

    //===============================================

    //                ACTION CARDS

    //===============================================
    _targetPlayers(authorPlayerId, targetCase, targetPlayerId) {
        const playerManager = this.getPlayerManager();

        let targetPlayers = [];
        switch (targetCase) {
            case Card.TARGET_ALL: // target everyone else
                targetPlayers = playerManager.filter(
                    (player) => player.getId() !== authorPlayerId
                );
                break;
            case Card.TARGET_ONE: // target one person
                targetPlayers = [playerManager.getPlayer(targetPlayerId)];
                break;
            default:
                throw "undefined target";
        }
        return targetPlayers;
    }

    _getAllCardsPlayerHasOnTable(playerId) {
        const game = this;
        const result = [];

        // Get all cards from bank - only cards with values can be there
        game.getPlayerBank(playerId)
            .getAllCardIds()
            .forEach((cardId) => {
                result.push(cardId);
            });

        // Get all cards from collections with value
        const playerManager = game.getPlayerManager();
        playerManager
            .getAllCollectionIdsForPlayer(playerId)
            .forEach((collectionId) => {
                const collection = playerManager.getCollection(collectionId);
                if (collection) {
                    collection.getAllCards().forEach((card) => {
                        if (card.getValue() > 0) {
                            result.push(card.getId());
                        }
                    });
                }
            });

        return result;
    }

    chargePlayerValue(cardId, targetPlayerId) {
        const game = this;

        // Must have actions left
        const turn = game.getTurn();
        const authorPlayerId = turn.getPlayerId();
        if (!turn.isWithinActionLimit()) {
            return false;
        }

        const cardManager = game.getCardManager();
        const card = cardManager.getCard(cardId);

        if (!card) {
            return false;
        }

        if (!card.hasTag(Card.TAG_COLLECT_VALUE)) {
            return false;
        }

        const collectData = card.getMeta(Card.COMP_COLLECT_VALUE);
        const chargeValue = collectData.amount;
        const chargeTargetType = collectData.target;

        // Target players
        let targetPlayers = game._targetPlayers(
            authorPlayerId,
            chargeTargetType,
            targetPlayerId
        );

        if (!targetPlayers) {
            return false;
        }

        // Play card to active pile
        const playerHand = game.getPlayerHand(authorPlayerId);
        game.getActivePile().addCard(playerHand.giveCard(cardId));
        turn.consumeAction();

        const requestManager = game.getRequestManager();
        targetPlayers.forEach((targetPlayer) => {
            const targetPlayerId = targetPlayer.getId();
            const newRequest = new RequestValue(game);
            newRequest.setAuthorId(authorPlayerId);
            newRequest.setTargetId(targetPlayerId);
            newRequest.setValue(chargeValue);
            if (card.hasTag(Card.TAG_CONTESTABLE)) {
                newRequest.setIsContestable(true);
            }

            requestManager.createNewRequestStack(newRequest);
        });
    }

    chargeRentForCollection(collectionId, cardId, targetPlayerId = null) {
        const game = this;

        // Must have actions left
        const turn = game.getTurn();
        if (!turn.isWithinActionLimit()) {
            return null;
        }

        // cannot target self as both target and recipient
        const authorPlayerId = turn.getPlayerId();
        if (targetPlayerId === authorPlayerId) {
            return null;
        }

        // cannot charge rent for collect player doesn't own
        const collection = game.getCollection(collectionId);
        if (authorPlayerId !== collection.getPlayerId()) {
            return null;
        }

        // recipient must have card in hand to play
        const playerManager = game._playerManager;
        const playerHand = playerManager.getPlayerHand(authorPlayerId);
        if (!playerHand.hasCard(cardId)) {
            return null;
        }

        // rent card must match the set
        const card = playerHand.getCard(cardId);
        const collectionActiveSet = collection.getActiveSet();
        const rentData = card.getMeta(Card.COMP_RENT);
        if (!rentData.sets.includes(collectionActiveSet)) {
            return null;
        }

        // Play card to active pile
        game.getActivePile().addCard(playerHand.giveCard(cardId));
        turn.consumeAction();

        // Target players
        let targetPlayers = game._targetPlayers(rentData.target);

        // Create requests
        const requestManager = game.getRequestManager();
        const rentValue = collection.calculateRent();
        targetPlayers.forEach((targetPlayer) => {
            const newRequest = new RequestRent(game);
            newRequest.setAuthorId(authorPlayerId);
            newRequest.setTargetId(targetPlayer.getId());
            newRequest.setCollectionId(collectionId);
            newRequest.setValue(rentValue);
            if (card.hasTag(Card.TAG_CONTESTABLE)) {
                newRequest.setIsContestable(true);
            }

            requestManager.createNewRequestStack(newRequest);
        });
    }

    acceptRequest(playerId, requestId, responseObject) {}

    contestRequest(playerId, requestId, responseObject) {
        /*
        CardSelection
        @TODO 
        */
    }

    claimRequest(playerId, requestId) {}

    payRequest(playerId, requestId, bankCardIds, propertyCardIds) {
        const game = this;
        const requestManager = game.getRequestManager();
        const playerManager = game.getPlayerManager();
        const playerBank = playerManager.getPlayerBank(playerId);
        const request = requestManager.getRequest(requestId);

        propertyCardIds = propertyCardIds || [];

        // Only target player can pay
        if (request.getTargetId() !== playerId) {
            return null;
        }

        // Function only work on value requests
        if (request.getType() !== Request.TYPE_REQUEST_VALUE) {
            return null;
        }

        // Can only pay if request is not satisfied and being requested
        if (request.getStatus() !== Request.STATUS_REQUESTING) {
            return null;
        }

        let runningTotal = 0;
        const payingWithBankCards = [];
        const cardIds = [...new Set([...bankCardIds, ...propertyCardIds])]; // ensure all are unique
        cardIds.forEach((cardId) => {
            // does player have in bank?
            if (playerBank.hasCard(cardId)) {
                const card = playerBank.getCard(cardId);
                const value = card.getValue();
                if (value > 0) {
                    runningTotal += value;
                    payingWithBankCards.push(cardId);
                }
            } else {
                // is it in one of their collections?
                // @TODO
            }
        });
        const payInFull = runningTotal >= request.getValue();

        // Detect if the player has exausted their resources
        let hasNothingElseToPayWith = false; // @TODO checlk if there is properties
        if (!payInFull) {
            const cardsOnTable = game._getAllCardsPlayerHasOnTable(playerId);
            const remainingCards = cardsOnTable.filter(
                (c) => !cardIds.includes(x)
            );
            hasNothingElseToPayWith = remainingCards.length > 0;
        }

        if (payInFull || hasNothingElseToPayWith) {
            const wealthTransfer = request.getWealthTransfer();
            const transferToAuthor = wealthTransfer.addTransferDirection(
                WealthTransfer.DIRECTION_AUTHOR
            );

            // Transfer bank
            if (bankCardIds) {
                transferToAuthor.add(
                    Transfer.TRANSFER_BANK,
                    playerBank.giveCards(bankCardIds)
                );
            }

            // @TODO Transfer property

            // Mark as satisfied
            request.setIsSatisfied(true);
            return true;
        }
        return false;
    }

    claimRequestCards() {}

    //===============================================

    //                  SERIALIZE

    //===============================================

    encode(data) {
        return data;
    }

    decode(data) {
        return data;
    }

    serialize() {
        const result = {
            seed: this.getSeed(),
            hasStarted: this._hasStarted,
            hasEnded: this._hasEnded,
            minPlayerLimit: this._minPlayerLimit,
        };
        result.players = this._playerManager.serialize();
        result.turn = this._turnManager.serialize();
        result.cards = this._cardManager.serialize();

        return this.encode(result);
    }

    unserialize(encoded) {
        const data = this.decode(encoded);

        this.setSeed(data.seed);
        this._hasStarted = data.hasStarted;
        this._hasEnded = data.hasEnded;
        this._minPlayerLimit = data.minPlayerLimit;
        this._playerManager.unserialzie(data.players);
        this._turnManager.unserialzie(data.turn);
        this._cardManager.unserialzie(data.cards);
    }
};
