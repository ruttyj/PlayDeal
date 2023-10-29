const AutoIncRepo = require("../../base/AutoIncRepo");
const RequestStack = require("./RequestStack");

module.exports = class RequestManager {
    constructor(game) {
        this._game = game;
        this._requests = new AutoIncRepo();
        this._requestStacks = new AutoIncRepo();
    }

    //===============================================

    //                 Requests

    //===============================================
    createNewRequestStack(request) {
        this._requests.insert(request);

        const reqStack = new RequestStack(this._game);
        this._requestStacks.insert(reqStack);
        reqStack.pushRequestId(request.getId());

        return reqStack;
    }

    filterRequests(fn) {
        const result = [];
        this._requests.forEach((request) => {
            if (fn(request)) {
                result.push(request);
            }
        });

        return result;
    }

    getRequest(requestId) {
        return this._requests.get(requestId);
    }

    getRequestsByPlayerId(playerId) {
        return this.filterRequests(
            (request) => request.getAuthorId() === playerId
        );
    }

    getRequestTargetedAtPlayerId(playerId) {
        return this.filterRequests(
            (request) => request.getTargetId() === playerId
        );
    }

    //===============================================

    //                  Serialize

    //===============================================
    serialize() {
        return {
            requests: this._requests
                .getAll()
                .map((request) => request.serialize()),
        };
    }
};
