const Request = require("../Request");
const RequestWealthTransfer = require("./RequestWealthTransfer");

module.exports = class RequestValue extends RequestWealthTransfer {
    constructor(game) {
        super(game);
        this._type = Request.TYPE_REQUEST_VALUE;
        this._value = 0;
        this._collectionId = null;
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

    //                  Serialize

    //===============================================
    serialize() {
        return {
            ...super.serialize(),
            value: this.getValue(),
        };
    }
};
