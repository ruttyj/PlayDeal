const AutoIncRepo = require("../../base/AutoIncRepo");
const RequestStack = require("./RequestStack");

module.exports = class RequestManager {
    constructor(game) {
        this._game = game;
        this._requests = new AutoIncRepo();
        this._requestStacks = new AutoIncRepo();
    }

    //===============================================

    //                Request Stack

    //===============================================
    createNewRequestStack(request) {
        this._requests.insert(request);

        const reqStack = new RequestStack(this._game);
        this._requestStacks.insert(reqStack);
        reqStack.pushRequestId(request.getId());
        request.setRequestStackId(reqStack.getId());

        return reqStack;
    }

    getRequestStack(stackId) {
        return this._requestStacks(stackId);
    }

    addRequestToStack(requestId, stackId) {
        const requestStack = this.getRequestStack(stackId);
        requestStack.pushRequestId(requestId);
    }

    //===============================================

    //                 Requests

    //===============================================
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

    //                  Actions

    //===============================================
    contestRequest(playerId, requestId, cardSelection) {
        const game = this._game;
        const requestManager = this;
        const playerManager = game.getPlayerManager();
        const playerHand = playerManager.getPlayerBank(playerId);
        const request = requestManager.getRequest(requestId);
        const activePile = game.getActivePile();

        // Only target player can pay
        if (request.getTargetId() !== playerId) {
            return false;
        }

        if (!request.isContestable()) {
            return false;
        }

        // Can only pay if request if not satisfied and being requested
        if (request.getStatus() !== Request.STATUS_REQUESTING) {
            return false;
        }

        const actionCards = cardSelection.getSelection(
            CardSelection.TYPE_ACTION
        );

        // Validate contest card
        let hasValidContestCard = false;
        let contestCard = null;
        actionCards.forEach((card) => {
            const cardIsConestable = card.hasTag(Card.TAG_CONTESTABLE);
            const cardCanDeclineRequest = card.hasTag(Card.TAG_DECLINE_REQUEST);
            const isInPlayersHand = playerHand.hasCard(card);

            if (isInPlayersHand && cardIsConestable && cardCanDeclineRequest) {
                hasValidContestCard = true;
                contestCard = card;
            }
        });

        // Create contest request
        if (hasValidContestCard) {
            // Pay action card from hand
            activePile.addCard(playerHand.giveCard(contestCard));

            // Create contest request
            const newRequest = new RequestContest(game);
            newRequest.setTargetRequestId(requestId);
            newRequest.setAuthorId(request.getTargetId());
            newRequest.setTargetId(request.getAuthorId());
            requestManager.addRequestToStack(
                newRequest.getId(),
                request.getRequestStackId()
            );
            return true;
        }

        return false;
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
