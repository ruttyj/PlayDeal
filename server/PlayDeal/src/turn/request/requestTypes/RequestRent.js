const Request = require("../Request");
const RequestValue = require("./RequestValue");

module.exports = class RequestRent extends RequestValue {
    constructor(game) {
        super(game);
        this._type = Request.TYPE_REQUEST_RENT;
        this._collectionId = null;
    }

    //===============================================

    //                   Value

    //===============================================
    getValue() {
        return this._value;
    }

    //===============================================

    //                 Collection ID

    //===============================================
    setCollectionId(value) {
        this._collectionId = value;
    }

    getCollectionId() {
        return this._collectionId;
    }

    //===============================================

    //                  Serialize

    //===============================================
    serialize() {
        return {
            ...super.serialize(),
            value: this._value,
            collectionId: this._collectionId,
        };
    }
};
