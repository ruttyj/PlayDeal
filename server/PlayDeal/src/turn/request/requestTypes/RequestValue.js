const Request = require("../Request");
const RequestWealthTransfer = require("./RequestWealthTransfer");

module.exports = class RequestValue extends RequestWealthTransfer {
    constructor(game) {
        super(game);
        this._type = Request.TYPE_REQUEST_VALUE;
        this._value = 0;
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
