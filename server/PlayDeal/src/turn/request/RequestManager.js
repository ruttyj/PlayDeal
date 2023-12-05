const AutoIncRepo = require("../../base/AutoIncRepo");
const RequestStack = require("./RequestStack");
const Request = require("../../turn/request/Request");
const RequestContest = require("../request/requestTypes/RequestContest");
const CardSelection = require("../../card/CardSelection");
const Card = require("../../card/Card");

module.exports = class RequestManager {
    constructor(game) {
        this._game = game;
        this._requests = new AutoIncRepo();
        this._requestStacks = new AutoIncRepo();
    }

    //===============================================

    //                Request Stack

    //===============================================
    createNewRequestOnNewStack(request) {
        this._requests.insert(request);

        const requestStack = new RequestStack(this._game);
        this._requestStacks.insert(requestStack);

        requestStack.pushRequestId(request.getId());
        request.setRequestStackId(requestStack.getId());
    }

    createNewRequestOnStack(request, requestStack) {
        this._requests.insert(request);

        const requestId = request.getId();
        const requestStackId = requestStack.getId();

        requestStack.pushRequestId(requestId);
        request.setRequestStackId(requestStackId);
    }

    getRequestStack(stackId) {
        return this._requestStacks.get(stackId);
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

    findRequest(fn) {
        let result = null;
        try {
            this._requests.forEach((request) => {
                if (fn(request)) {
                    result = request;
                    throw "break loop";
                }
            });
        } catch {
            // NOPE
        }

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
        const playerHand = playerManager.getPlayerHand(playerId);
        const originalRequest = requestManager.getRequest(requestId);
        const activePile = game.getActivePile();

        // Only target player can pay
        if (originalRequest.getTargetId() !== playerId) {
            return null;
        }

        if (!originalRequest.isContestable()) {
            return null;
        }

        // Can only pay if request if not satisfied and being requested
        if (originalRequest.getStatus() !== Request.STATUS_REQUESTING) {
            return null;
        }

        const actionCards = cardSelection.getSelection(
            CardSelection.TYPE_ACTION
        );

        // Validate contest card
        let hasValidContestCard = false;
        let contestCard = null;
        actionCards.forEach((card) => {
            const cardCanDeclineRequest = card.hasTag(Card.TAG_DECLINE_REQUEST);
            const isInPlayersHand = playerHand.hasCard(card);

            if (isInPlayersHand && cardCanDeclineRequest) {
                hasValidContestCard = true;
                contestCard = card;
            }
        });

        // Create contest request
        if (hasValidContestCard) {
            // Pay action card from hand
            activePile.addCard(playerHand.giveCard(contestCard));

            // Create contest request
            const requestStackId = originalRequest.getRequestStackId();
            const requestStack = this.getRequestStack(requestStackId);

            // Create Contest request
            const newRequest = new RequestContest(game);
            newRequest.setTargetRequestId(requestId);
            if (contestCard.hasTag(Card.TAG_CONTESTABLE)) {
                newRequest.setIsContestable(true);
            }
            newRequest.setAuthorId(originalRequest.getTargetId());
            newRequest.setTargetId(originalRequest.getAuthorId());

            requestManager.createNewRequestOnStack(newRequest, requestStack);

            return newRequest;
        }

        return null;
    }

    acceptRequest(playerId, requestId, cardSelection = null) {
        const game = this._game;
        const requestManager = this;
        const originalRequest = requestManager.getRequest(requestId);

        switch (originalRequest.getType()) {
            case Request.TYPE_REQUEST_CONTEST:
                originalRequest.comply(cardSelection);
                break;
            case Request.TYPE_REQUEST_VALUE:
                /*
                const wealthTransfer = originalRequest.getWealthTransfer();
                const transferToAuthor = wealthTransfer.getTransferDirection(
                    WealthTransfer.DIRECTION_AUTHOR
                );
                */
                break;
            default:
            // NOPE
        }
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
