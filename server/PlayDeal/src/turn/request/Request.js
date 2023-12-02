const Model = require("../../base/Model");

module.exports = class Request extends Model {
    static TYPE_REQUEST_VALUE = "requestValue";
    static TYPE_REQUEST_RENT = "requestRent";

    static STATUS_REQUESTING = "requesting";
    static STATUS_CONTESTED = "contested";
    static STATUS_ACCEPTED = "accepted";
    static STATUS_DECLINED = "declined";

    constructor(game) {
        super();
        this._game = game;
        this._parent = null;
        this._type = null; // type of request
        this._target = null; // person being targeted
        this._author = null; // person making request
        this._contestable = false;
        this._isClaimable = false;
        this._status = Request.STATUS_REQUESTING;
        this._isSatisfied = false; // target has satisfied the request - parties may claim their rewards
        this._isClosed = false; // is completly over and done with
    }

    //===============================================

    //                  References

    //===============================================
    getGameRef() {
        return this._game;
    }

    //===============================================

    //                 Contestable

    //===============================================
    setIsContestable(contestable) {
        this._contestable = contestable;
    }

    isContestable() {
        return this._contestable;
    }

    //===============================================

    //                    Status

    //===============================================
    setStatus(status) {
        this._status = status;
    }

    getStatus() {
        return this._status;
    }

    //===============================================

    //                    Type

    //===============================================
    setType(type) {
        this._type = type;
    }

    getType() {
        return this._type;
    }

    //===============================================

    //                    Target

    //===============================================
    setTargetId(target) {
        this._target = target;
    }

    getTargetId() {
        return this._target;
    }

    //===============================================

    //                   Author ID

    //===============================================
    setAuthorId(author) {
        this._author = author;
    }

    getAuthorId() {
        return this._author;
    }

    //===============================================

    //                  Is Satisfied

    //===============================================
    setIsSatisfied(isSatisfied) {
        this._isSatisfied = isSatisfied;
    }

    isSatisfied() {
        return this._isSatisfied;
    }

    //===============================================

    //                   Is Closed

    //===============================================
    setClosed(isClosed) {
        this._isClosed = isClosed;
    }

    isClosed() {
        return this._isClosed;
    }

    //===============================================

    //              Resolve Methods

    //===============================================
    accept() {
        this.setIsSatisfied(true);
        this.setStatus(Request.STATUS_ACCEPTED);
    }

    contest() {}

    decline() {
        this.setIsSatisfied(true);
        this.setStatus(Request.STATUS_DECLINED);
    }

    //===============================================

    //                 Claimable

    //===============================================
    isClaimable() {
        return this._isClaimable && !this.isClosed();
    }

    claim() {
        if (this.isClaimable() && this.isSatisfied()) {
            this.setClosed(true);
        }
    }

    //===============================================

    //                  Serialize

    //===============================================
    serialize() {
        return {
            ...super.serialize(),
            type: this.getType(),
            target: this.getTargetId(),
            author: this.getAuthorId(),
            contestable: this.isContestable(),
            status: this.getStatus(),
            isSatisfied: this.isSatisfied(),
            isClosed: this.isClosed(),
        };
    }
};
