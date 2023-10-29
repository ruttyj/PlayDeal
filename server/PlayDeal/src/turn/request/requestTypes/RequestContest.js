const Request = require("../Request");

module.exports = class RequestContest extends Request {
    constructor(game) {
        super(game);
        this._targetRequestId = null;
    }

    //===============================================

    //             Target Request Id

    //===============================================
    setTargetRequestId(value) {
        this._collectionId = value;
    }

    getTargetRequestId() {
        return this._targetRequestId;
    }

    //===============================================

    //              Resolve Methods

    //===============================================
    accept() {
        const requestManager = this._game.getRequestManager();
        const targetRequest = requestManager.getRequest(
            this.getTargetRequestId
        );
        if (targetRequest) {
            targetRequest.decline();
        }
    }

    decline() {
        const requestManager = this._game.getRequestManager();
        const targetRequest = requestManager.getRequest(
            this.getTargetRequestId
        );
        if (targetRequest) {
            targetRequest.accept();
        }
    }

    //===============================================

    //                  Serialize

    //===============================================
    serialize() {
        return {
            ...super.serialize(),
            targetRequestId: this._targetRequestId,
        };
    }
};
