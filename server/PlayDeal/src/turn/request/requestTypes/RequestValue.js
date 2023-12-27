const Request = require("../Request");
const RequestWealthTransfer = require("./RequestWealthTransfer");
const WealthTransfer = require("../WealthTransfer");
const Transfer = require("../Transfer");
const SelectionContext = require("../../../card/SelectionContext");
/**
 * =====================================================
 *
 *                     Request Value
 *
 * =====================================================
 */
module.exports = class RequestValue extends RequestWealthTransfer {
    constructor(game) {
        super(game);
        this._type = Request.TYPE_REQUEST_VALUE;
        this._value = 0;
    }

    //===============================================

    //                User Actions

    //===============================================
    comply(selectionContext) {
        const game = this.getGameRef();

        const request = this;
        const requestValue = this.getValue();
        const wealthTransfer = request.getWealthTransfer();
        const transferToAuthor = wealthTransfer.addTransferDirection(
            WealthTransfer.DIRECTION_AUTHOR
        );
        const targetPlayerId = this.getTargetId();
        const playerManager = game.getPlayerManager();
        const targetPlayerBank = playerManager.getPlayerBank(targetPlayerId);

        if (!(selectionContext instanceof SelectionContext)) {
            return;
        }

        let smallestValue = null;
        let isPayingWithBank = false;
        let isPayingWithProerty = false;

        // calculate value of bank
        let bankCardsValue = 0; // Pay with bank
        const payingWithBankCards = selectionContext.getSelection(
            SelectionContext.TYPE_BANK
        );
        if (payingWithBankCards.count() > 0) {
            payingWithBankCards.forEach((card) => {
                const cardVal = card.getValue();
                if (cardVal > 0) {
                    isPayingWithBank = true;
                    bankCardsValue += cardVal;
                }
                if (smallestValue === null || smallestValue < cardVal) {
                    smallestValue = cardVal;
                }
            });
        }

        // Pay with property
        let propertyCardValue = 0;
        const payingWithPropertryCards = selectionContext.getSelection(
            SelectionContext.TYPE_PROPERTY
        );
        if (payingWithPropertryCards && payingWithPropertryCards.count() > 0) {
            payingWithPropertryCards.forEach((card) => {
                const cardVal = card.getValue();
                if (cardVal > 0) {
                    propertyCardValue += cardVal;
                    isPayingWithProerty = true;
                }
                if (smallestValue === null || smallestValue < cardVal) {
                    smallestValue = cardVal;
                }
            });
        }

        // Is over paying?
        const totalValue = bankCardsValue + propertyCardValue;
        if (totalValue - requestValue > smallestValue) {
            return false;
        }

        //@TODO add cards to request
        if (isPayingWithBank) {
            payingWithBankCards.forEach((card) => {
                transferToAuthor.add(
                    Transfer.TRANSFER_BANK,
                    targetPlayerBank.giveCard(card)
                );
            });
        }

        if (isPayingWithProerty) {
            payingWithPropertryCards.forEach((card) => {
                /*
                // @TODO
                transferToAuthor.add(
                    Transfer.TRANSFER_PROPERTY,
                    targetPlayerBank.giveCard(card)
                );
              */
            });
        }

        // Have they paid enough, do they have anything else
        super.comply(selectionContext);
    }

    contest(selectionContext) {
        super.contest(selectionContext);
    }

    //===============================================

    //                   Value

    //===============================================
    setValue(value) {
        this._value = value;
    }

    getValue() {
        return this._value;
    }

    //===============================================

    //              Resolve Methods

    //===============================================
    accept() {
        const requestManager = this._game.getRequestManager();

        super.accept();
    }

    decline() {
        const requestManager = this._game.getRequestManager();
        this.setClosed(true);
        super.decline();
    }

    //===============================================

    //                  Serialize

    //===============================================
    serialize() {
        return {
            ...super.serialize(),
            value: this.getValue(),
        };
    }
};
