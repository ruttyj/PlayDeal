const Player = require("../player/Player");
const AutoIncRepo = require("../base/AutoIncRepo");
const Repo = require("../base/Repo");
const CardContainer = require("../card/CardContainer");
const Collection = require("../card/Collection");

module.exports = class PlayerManager {
    constructor(game) {
        this._players = new AutoIncRepo();
        this._playerCollections = new AutoIncRepo();
        this._playerCollectionMap = new Map();
        this._playerHands = new Repo();
        this._playerBanks = new Repo();
        this._cardManager = game.getCardManager();
    }

    setup() {
        //nope
    }

    getPlayerCount() {
        return this._players.count();
    }

    addPlayer() {
        const newPlayer = new Player();
        const playerModel = this._players.insert(newPlayer);
        const playerId = playerModel.getId();
        this._playerHands.set(playerId, new CardContainer(this._cardManager));
        this._playerBanks.set(playerId, new CardContainer(this._cardManager));
        this._playerCollectionMap.set(playerId, []);
        return playerModel;
    }

    makeNewCollectionForPlayer(playerId) {
        if (this._players.has(playerId)) {
            const newModel = this._playerCollections.insert(
                new Collection(playerId, this._cardManager)
            );
            const modelId = newModel.getId();

            // Add collection id to list of collections for player
            const collectionIds = this._playerCollectionMap.get(playerId);
            collectionIds.push(modelId);
            this._playerCollectionMap.set(playerId, collectionIds);

            return newModel;
        }

        return null;
    }

    getAllCollectionIdsForPlayer(playerId) {
        const result = [];
        const collectionList = this._playerCollectionMap.get(playerId);
        if (collectionList) {
            collectionList.forEach((collectionId) => {
                result.push(collectionId);
            });
        }
        return result;
    }

    getCollection(collectionId) {
        return this._playerCollections.get(collectionId);
    }

    getCollectionIdsForPlayerId(playerId) {
        return this._playerCollectionMap.get(playerId);
    }

    getCollectionsForPlayerId(playerId) {
        return this._playerCollectionMap
            .get(playerId)
            .map((collectionId) => this.getCollection(collectionId));
    }

    deleteCollection(collectionId) {
        const collection = this.getCollection(collectionId);
        const playerId = collection.getPlayerId();
        if (collection.cardCount() === 0) {
            this._playerCollections.delete(collectionId);

            // remove from player - collection map
            const playerCollections =
                this.getCollectionIdsForPlayerId(playerId);
            this._playerCollectionMap.set(
                playerId,
                playerCollections.filter((id) => id !== collectionId)
            );
        }
    }

    getPlayer(playerId) {
        return this._players.get(playerId);
    }

    getPlayerHand(playerId) {
        return this._playerHands.get(playerId);
    }

    getPlayerBank(playerId) {
        return this._playerBanks.get(playerId);
    }

    getAllPlayerIds() {
        return this._players.getAllKeys();
    }

    removePlayer() {
        //@TODO
    }

    hasPlayer(playerId) {
        return this._players.has(playerId);
    }

    iterate(fn) {
        try {
            this._players.getAll().forEach((v) => {
                if (fn(v)) {
                    throw "short circuit loop";
                }
            });
        } catch {
            // nop
        }
    }

    filter(fn) {
        let result = [];

        this._players.getAll().forEach((v) => {
            if (fn(v)) {
                result.push(v);
            }
        });

        return result;
    }

    serialize() {
        return {
            players: this._players.serialize(),
            collections: this._playerCollections.serialize(),
            hands: this._playerHands.serialize(),
            banks: this._playerBanks.serialize(),
        };
    }

    unserialize(data) {
        this._players.unserialize(data.players);
        this._playerCollections.unserialize(data.collections);
        this._playerHands.unserialize(data.hands);
        this._playerBanks.unserialize(data.banks);
    }
};
