module.exports = class Transfer {
    static TRANSFER_BANK = "bank";
    static TRANSFER_PROPERTY = "property";

    constructor() {
        this._transferCards = new Map();
        this._claimedCards = new Map();
        this._isCompleted = false;
    }

    isCompleted() {
        return this._isCompleted;
    }

    add(transferType, cardIds) {
        // allow single or multiple value to be passed
        cardIds = Array.isArray(cardIds) ? cardIds : [cardIds];

        // get or make new card container
        let container = this._getTransferCards(transferType);

        // add cards
        cardIds.forEach((cardId) => {
            container.push(cardId);
        });

        this._transferCards.set(transferType, container);
        this._updateCompleted();
    }

    claim(transferType, cardIds) {
        cardIds = Array.isArray(cardIds) ? cardIds : [cardIds];
        const transferCards = this._transferCards.get(transferType);

        if (!transferCards) {
            return null;
        }

        const claimCards = this._getClaimCards(transferType);
        cardIds.forEach((cardId) => {
            // card was transfered and not yet claimed
            if (
                !claimCards.includes(cardId) &&
                transferCards.includes(cardId)
            ) {
                claimCards.push(cardId);
            }
        });
        this._claimedCards.set(transferType, claimCards);
        this._updateCompleted();
    }

    getTransferingCardsIdsForTransferType(transferType) {
        return this._getTransferCards(transferType);
    }

    getClaimedCardsIdsForTransferType(transferType) {
        return this._getClaimCards(transferType);
    }

    _getTransferCards(transferType) {
        let container;
        if (!this._transferCards.has(transferType)) {
            container = [];
        } else {
            container = this._transferCards.get(transferType);
        }

        return container;
    }

    _getClaimCards(transferType) {
        let container;
        if (!this._claimedCards.has(transferType)) {
            container = [];
        } else {
            container = this._claimedCards.get(transferType);
        }

        return container;
    }

    _updateCompleted() {
        let isSomethingToClaim = false;

        this._transferCards.forEach((cardList, transferType) => {
            const transferCards = this._getTransferCards(transferType);
            const claimedCards = this._getClaimCards(transferType);

            if (transferCards.length > 0) {
                if (transferCards.length !== claimedCards.length) {
                    isSomethingToClaim = true;
                }
            }
        });

        // has everything been claimed
        this._isCompleted = !isSomethingToClaim;
    }

    serialize() {
        const transfering = {};
        this._transferCards.forEach((cardList, transferType) => {
            transfering[transferType] = cardList;
        });

        const claimed = {};
        this._claimedCards.forEach((cardList, transferType) => {
            claimed[transferType] = cardList;
        });

        return {
            transfering: transfering,
            claimed: claimed,
            completed: this._isCompleted,
        };
    }
};
