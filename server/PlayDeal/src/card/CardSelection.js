const CardContainer = require("./CardContainer");

module.exports = class CardSelection {
    static TYPE_ACTION = "action";
    static TYPE_BANK = "bank";
    static TYPE_PROPERTY = "property";

    constructor(game) {
        this._game = game;
        this._cardManager = this._game.getCardManager();
        this._selectionMap == new Map();
    }

    static getAllTypes() {
        return [
            CardSelection.TYPE_ACTION,
            CardSelection.TYPE_BANK,
            CardSelection.TYPE_PROPERTY,
        ];
    }

    hasSelection(selectionType) {
        return this._selectionMap.has(selectionType);
    }

    getSelection(selectionType) {
        if (!this.hasSelection(selectionType)) {
            return null;
        }

        return this._selectionMap.get(selectionType);
    }

    addSelection(selectionType, values) {
        let selectionContainer;
        if (this.hasSelection(selectionType)) {
            selectionContainer = this.getSelection(selectionType);
        } else {
            selectionContainer = new CardContainer(this._cardManager);
        }

        selectionContainer.addCards(values);

        this._selectionMap.set(selectionType, selectionContainer);

        return this;
    }
};
