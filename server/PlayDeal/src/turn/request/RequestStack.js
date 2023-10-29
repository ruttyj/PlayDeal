const Model = require("../../base/Model");

module.exports = class RequestStack extends Model {
    constructor(game) {
        super(game);
        this._requestIds = [];
    }

    //===============================================

    //                 Request Ids

    //===============================================
    pushRequestId(requestId) {
        this._requestIds.push(requestId);
    }
};
