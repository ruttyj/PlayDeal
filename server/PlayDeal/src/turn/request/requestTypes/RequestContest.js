const Request = require("../Request");

module.exports = class RequestContest extends Request {
    constructor(game) {
        super(game);
        this._type = Request.TYPE_REQUEST_CONTEST;
        this._targetRequestId = null;
    }

    //===============================================

    //             Target Request Id

    //===============================================
    setTargetRequestId(value) {
        this._targetRequestId = value;

        const requestManager = this._game.getRequestManager();
        const targetRequest = requestManager.getRequest(value);
        targetRequest.setStatus(Request.STATUS_CONTESTED);
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
            this.getTargetRequestId()
        );
        targetRequest.decline();
        super.accept();
    }

    decline() {
        const requestManager = this._game.getRequestManager();
        const targetRequest = requestManager.getRequest(
            this.getTargetRequestId()
        );

        // Reopen parent request
        targetRequest.setStatus(Request.STATUS_REQUESTING);
        super.decline();
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
