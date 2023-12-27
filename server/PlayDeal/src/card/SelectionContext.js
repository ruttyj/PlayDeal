const CardContainer = require("./CardContainer");

module.exports = class SelectionContext {
    // Cards
    static TYPE_ACTION = "action";
    static TYPE_BANK = "bank";
    static TYPE_PROPERTY = "property";

    // Request
    static TYPE_REQUEST = "request";

    // Collections
    // @TODO

    constructor(game) {
        this._game = game;
        this._cardManager = this._game.getCardManager();
        this._selectionMap = new Map();
    }

    static getAllCardTypes() {
        return [
            SelectionContext.TYPE_ACTION,
            SelectionContext.TYPE_BANK,
            SelectionContext.TYPE_PROPERTY,
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
        const isRequestType = selectionType === SelectionContext.TYPE_REQUEST;

        let selectionContainer;
        if (this.hasSelection(selectionType)) {
            selectionContainer = this.getSelection(selectionType);
        } else {
            if (isRequestType) {
                selectionContainer = new Map();
            } else {
                selectionContainer = new CardContainer(this._cardManager);
            }
        }

        if (isRequestType) {
            if (Array.isArray(values)) {
                values.forEeach((value) => {
                    selectionContainer.set(value);
                });
            } else {
                selectionContainer.set(value);
            }
        } else {
            selectionContainer.addCards(values);
        }

        this._selectionMap.set(selectionType, selectionContainer);

        return this;
    }
};
