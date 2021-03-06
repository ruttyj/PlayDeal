function buildCollectCardToBankAction({
    Affected,
    handleTransferResponse,
})
{
    return function (props)
    {
        let doTheThing = function (consumerData) {
            let { cardId } = consumerData;
            let { _Affected, thisPersonId, playerBank, transfering, checkpoints, request } = consumerData;
            if (transfering.has("bank")) {
                let cardExists = transfering
                .get("bank")
                .getRemainingList()
                .includes(cardId);
                if (cardExists) {
                    playerBank.addCard(cardId);
                    transfering.get("bank").confirm(cardId);
                }
        
                _Affected.setAffected('REQUEST', request.getId(), Affected.ACTION.UPDATE);
                _Affected.setAffected('BANK', thisPersonId);
        
                checkpoints.set("success", true);
            }
        };
    
        return handleTransferResponse(
            "RESPONSES",
            "COLLECT_CARD_TO_BANK",
            props,
            doTheThing
        );
    }
}

module.exports = buildCollectCardToBankAction;
