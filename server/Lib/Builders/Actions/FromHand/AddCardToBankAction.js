function buildAddCardToBankAction({
    makeProps,
    makeConsumerFallbackResponse,
    registry,
    makeResponse,
    packageCheckpoints,
    isDef,
    handCardConsumer,
    AddressedResponse,
    log,
})
{
    return function (props)
    {
        let subject = "MY_TURN";
        let action = "ADD_CARD_TO_MY_BANK_FROM_HAND";
        const addressedResponses = new AddressedResponse();
        let status = "failure";
        return handCardConsumer(
          props,
          (props2, checkpoints) => {
            checkpoints.set("isActionPhase", false);
            checkpoints.set("isCardInHand", false);
            checkpoints.set("cardCanBeAddedToBank", false);

            let { cardId } = props2;
            let { hand, roomCode, game, personManager, thisPersonId } = props2;
            if (game.getCurrentTurn().getPhaseKey() === "action") {
              checkpoints.set("isActionPhase", true);

              let card = hand.getCardById(cardId);
              if (isDef(card)) {
                checkpoints.set("isCardInHand", true);

                checkpoints.set("isWithinActionLimit", false);
                if (game.getCurrentTurn().isWithinActionLimit()) {
                  checkpoints.set("isWithinActionLimit", true);

                  if (game.canCardBeAddedToBank(card)) {
                    checkpoints.set("cardCanBeAddedToBank", true);

                    let isWildCard = game.doesCardHaveTag(card, "wild");

                    let bank = game.getPlayerBank(thisPersonId);
                    let hand = game.getPlayerHand(thisPersonId);
                    bank.addCard(hand.giveCard(cardId));
                    game.getCurrentTurn().setActionPreformed("BANK", card);

                    status = "success";

                    //PLAYER_HANDS
                    // Update everyone with my new hand
                    let allPlayerIds = game.getAllPlayerKeys();
                    addressedResponses.addToBucket(
                      "default",
                      registry.execute('PLAYER_HANDS.GET_KEYED', makeProps(props, {
                        roomCode,
                        personId: thisPersonId,
                        receivingPeopleIds: allPlayerIds,
                      }))
                    );
                    //PLAYER_BANKS
                    addressedResponses.addToBucket(
                      "default",
                      registry.execute('PLAYER_BANKS.GET_KEYED', makeProps(props, {
                        roomCode,
                        personId: thisPersonId,
                        receivingPeopleIds: allPlayerIds,
                      }))
                    );

                    //PLAYER_TURN
                    // Update current turn state
                    addressedResponses.addToBucket(
                      "everyone",
                      registry.execute('PLAYER_TURN.GET', makeProps(props))
                    );

                    // Wildcard could be any set, let other know
                    if (isWildCard) {
                      addressedResponses.addToBucket(
                        "everyone",
                        registry.execute('CARDS.GET_KEYED', makeProps(props, {cardId}))
                      );
                    }

                    //ADD_CARD_TO_MY_BANK_FROM_HAND
                    // Confirm this executed
                    let payload = {
                      checkpoints: packageCheckpoints(checkpoints),
                    };
                    addressedResponses.addToBucket(
                      "default",
                      makeResponse({ subject, action, status, payload })
                    );

                    if (game.checkWinConditionForPlayer(thisPersonId)) {
                      addressedResponses.addToBucket(
                        "everyone",
                        registry.execute('GAME.STATUS', makeProps(props))
                      );
                    }
                  } else {
                    log("!canCardBeAddedToBank");
                  }
                }
              }
            }

            return addressedResponses;
          },
          makeConsumerFallbackResponse({ subject, action, addressedResponses })
        );
      
    }
}

module.exports = buildAddCardToBankAction;
