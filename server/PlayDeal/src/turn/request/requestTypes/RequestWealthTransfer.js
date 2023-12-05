const Request = require("../Request");
const WealthTransfer = require("../WealthTransfer");
const Transfer = require("../Transfer");
module.exports = class RequestWealthTransfer extends Request {
    constructor(game) {
        super(game);
        this._wealthTransfer = new WealthTransfer();
    }

    //===============================================

    //              Resolve Methods

    //===============================================
    accept() {
        const game = this.getGameRef();
        const playerManager = game.getPlayerManager();

        const authorPlayerId = this.getAuthorId();
        const targetPlayerId = this.getTargetId();

        const request = this;
        const wealthTransfer = request.getWealthTransfer();

        /*
        //-------------------------------------------

        //          Transfer between banks

        //-------------------------------------------
        const transferBetweenBanks = (fromPlayerId, transfer, toPlayerId) => {
            const fromBank = playerManager.getPlayerBank(fromPlayerId);
            const toBank = playerManager.getPlayerBank(toPlayerId);

            const cardIds = transfer.getTransferingCardsIdsForTransferType(
                Transfer.TRANSFER_BANK
            );
            toBank.addCards(fromBank.giveCards(cardIds));
            transfer.claim(Transfer.TRANSFER_BANK, cardIds);
        };

        // Transfer to author
        const transferToAuthor = wealthTransfer.getTransferDirection(
            WealthTransfer.DIRECTION_AUTHOR
        );
        if (transferToAuthor) {
            transferBetweenBanks(
                targetPlayerId,
                transferToAuthor,
                authorPlayerId
            );
        }

        // Transfer to Target
        const transferToTarget = wealthTransfer.getTransferDirection(
            WealthTransfer.DIRECTION_TARGET
        );
        if (transferToTarget) {
            transferBetweenBanks(
                authorPlayerId,
                transferToTarget,
                targetPlayerId
            );
        }
        //-------------------------------------------

        //          Transfer properties

        //-------------------------------------------

        //@TODO

        // Conclude tranasction
        */
        super.accept();
    }

    decline() {
        this.setClosed(true);
        super.decline();
    }

    getWealthTransfer() {
        return this._wealthTransfer;
    }

    //===============================================

    //                  Serialize

    //===============================================
    serialize() {
        return {
            ...super.serialize(),
            transfer: this._wealthTransfer.serialize(),
        };
    }
};
