module.exports = function ({
  els,
  isDef,
  isDefNested,
  isFunc,
  isArr,
  log,
  getArrFromProp,

  Affected,
  Transaction,
  AddressedResponse,
  KeyedRequest,

  roomManager,

  makeProps,
  makeResponse,
  makeKeyedResponse,
  makePersonSpecificResponses,
  makeConsumerFallbackResponse,
  makeRegularGetKeyed,

  getAllKeyedResponse,
  packageCheckpoints,
  canGameStart,
  createGameInstance,

  handleRoom,
  handlePerson,
  handleGame,
  handleMyTurn,
  handCardConsumer,
  handleTransactionResponse,
  handleTransferResponse,
  handleRequestCreation,
  handleCollectionBasedRequestCreation,

  buildAttemptFinishTurnAction,
  buildDiscardToHandLimitAction,
  buildChargeRentAction,
  buildRequestValueAction,
  buildRespondToCollectValueAction,
  buildAcknowledgeCollectNothingAction,
  buildCollectCardToBankAutoAction,
  buildCollectCardToBankAction,
  buildCollectCardToCollectionAction,
  buildCollectCollectionAction,
  buildStealPropertyAction,
  buildRespondToStealPropertyAction,
  buildSwapPropertyAction,
  buildRespondToPropertySwapAction,
  buildDrawCardsAction,
  buildChangeCardActiveSetAction,
  buildRespondToJustSayNoAction,
  buildAddCardToBankAction,
  buildAddPropertyToNewCollectionAction,
  buildAddPropertyToExitingCollectionAction,
  buildAddSetAugmentToExistingCollectionAction,
  buildAddSetAugmentToNewCollectionAction,
  buildTransferPropertyToNewCollectionFromExistingAction,
  buildTransferPropertyToExistingCollectionFromExistingAction,
  buildTransferSetAugmentToExistingCollectionFromExistingAction,
  buildTransferSetAugmentToNewCollectionFromExistingAction, 
  buildStealCollectionAction,
  buildRespondToStealCollection,  
  buildTurnStartingDrawAction,
  buildRegisterRequestValueMethods,
  buildRegisterCollectionsMethods,
  buildRegisterCardMethods,
  buildRegisterPlayerMethods,
})
{
  const commonDeps = {
    // Helpers
    isDef, isArr, isFunc, 
    getArrFromProp, packageCheckpoints, makeProps,
    // Structures
    Affected, 
    Transaction,
    AddressedResponse,
    // Props
    roomManager, 
  }

  return function (registry)
  {
    let registerRequestValueMethods =  buildRegisterRequestValueMethods({
      registry,
      makeProps,
      commonDeps,
      isDefNested,
      buildRespondToCollectValueAction,
      buildChargeRentAction,
      buildRequestValueAction,
      makeResponse,
      makeConsumerFallbackResponse,
      handleGame,
      handleTransactionResponse,
      handleRequestCreation,
      handleCollectionBasedRequestCreation,
    })
    let registerCollectionsMethods = buildRegisterCollectionsMethods({
      registry,
      makeProps,
      isDef,
      AddressedResponse,
      KeyedRequest,
      makeResponse,
      makeKeyedResponse,
      getAllKeyedResponse,
      makeConsumerFallbackResponse,
      makeRegularGetKeyed,
      handleGame,
    })
    let registerCardMethods = buildRegisterCardMethods({
      registry,
      makeProps,
      AddressedResponse,
      KeyedRequest,
      makeResponse,
      makeKeyedResponse,
      getAllKeyedResponse,
      makeConsumerFallbackResponse,
      handleGame,
    })
    let registerPlayerMethods = buildRegisterPlayerMethods({
      registry,
      isDef,
      isArr,
      AddressedResponse,
      makeResponse,
      makePersonSpecificResponses,
      makeConsumerFallbackResponse,
      handleGame,
      makeProps,
    })

    registerRequestValueMethods(registry)
    registerCardMethods(registry);
    registerCollectionsMethods(registry);
    registerPlayerMethods(registry)

    registry.public(`GAME.GET_UPDATED_PILES`, (props) => {
      const { roomCode } = props;

      const addressedResponses = new AddressedResponse();
      if (isDef(roomCode)) {
        addressedResponses.addToBucket(
          "default",
          registry.execute('DRAW_PILE.GET', makeProps(props))
        );

        addressedResponses.addToBucket(
          "default",
          registry.execute('DISCARD_PILE.GET', makeProps(props))
        );

        addressedResponses.addToBucket(
          "default",
          registry.execute('ACTIVE_PILE.GET', makeProps(props))
        );
      }
      return addressedResponses;
    })
    registry.public(`GAME.RESET`, (props) => {
      const [subject, action] = ["GAME", "RESET"];
      const addressedResponses = new AddressedResponse();

      return handleRoom(
        props,
        (consumerData) => {
          const { room } = consumerData;
          let status = "success";
          let payload = null;

          createGameInstance(room);

          addressedResponses.addToBucket(
            "everyone",
            registry.execute('PLAYER_REQUESTS.REMOVE_ALL', makeProps(consumerData))
          );
          addressedResponses.addToBucket(
            "everyone",
            registry.execute('REQUESTS.REMOVE_ALL', makeProps(consumerData))
          );

          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status, payload })
          );

          return addressedResponses;
        },
        addressedResponses
      );
    })
    registry.public(`GAME.UPDATE_CONFIG`, (props) => {
      const [subject, action] = ["GAME", "UPDATE_CONFIG"];
      let payload = null;
      let status = "failure";
      const addressedResponses = new AddressedResponse();
      return handlePerson(
        props,
        (consumerData, checkpoints) => {
          const { config } = consumerData;
          const { room } = consumerData;

          const game = room.getGame();

          // Only alter config before the game has started
          checkpoints.set("gameHasNotYetStarted", false);
          if (!game.isGameStarted()) {
            checkpoints.set("gameHasNotYetStarted", true);
            if (isDef(config)) {
              status = "success";
              game.updateConfig(config);
            }
          }
          addressedResponses.addToBucket(
            "default",
            registry.execute('GAME.GET_CONFIG', makeProps(consumerData))
          );
          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status, payload })
          );

          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    registry.public(`GAME.GET_CONFIG`, (props) => {
      const [subject, action] = ["GAME", "GET_CONFIG"];
      let payload = null;
      let status = "failure";
      const addressedResponses = new AddressedResponse();
      return handlePerson(
        props,
        (consumerData) => {
          const { room } = consumerData;

          const game = room.getGame();

          status = "success";
          payload = {
            updatedConfig: isDef(game) ? game.getConfig() : null,
          };

          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status, payload })
          );

          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    registry.public(`GAME.STATUS`, (props) => {
              const [subject, action] = ["GAME", "STATUS"];
              const addressedResponses = new AddressedResponse();
              return handlePerson(
                props,
                (props2) => {
                  let { room } = props2;
      
                  const game = room.getGame();
                  let isGameStarted = isDef(game) ? game.isGameStarted() : false;
                  let isGameOver = isDef(game) ? game.isGameOver() : false;
                  let isInProgress = isGameStarted && !isGameOver;
                  let winningCondition = isDef(game)
                    ? game.getWinningCondition()
                    : null;
      
                  let status = "success";
                  let payload = {
                    isGameStarted,
                    isInProgress,
                    isGameOver,
                    winningCondition: winningCondition,
                  };
                  addressedResponses.addToBucket(
                    "default",
                    makeResponse({ subject, action, status, payload })
                  );
                  return addressedResponses;
                },
                makeConsumerFallbackResponse({ subject, action, addressedResponses })
              );
    })
    registry.public(`GAME.START`, (props) => {
      const [subject, action] = ["GAME", "START"];
      const addressedResponses = new AddressedResponse();
      return handlePerson(props,
        (consumerData) => {
          let { roomCode, personManager, thisPerson, room } = consumerData;
          let game = room.getGame();
          let canStart = canGameStart(game, personManager);
          if (thisPerson.hasTag("host") && canStart) {
            // Find the people in the room who are ready
            let attendingPeople = personManager.filterPeople(
              (person) =>
                person.isConnected() && person.getStatus() === "ready"
            );

            // Add players to game from list of people
            attendingPeople.forEach((person) => {
              game.createPlayer(person.getId());
            });

            // Initialize game
            game.startGame();
            game.nextPlayerTurn();

            // broadcast initial game data
            let peopleIds = attendingPeople.map((person) => person.getId());
            let specificPropsForEveryone = {
              roomCode,
              peopleIds: peopleIds,
              receivingPeopleIds: peopleIds,
            };

            addressedResponses.addToBucket(
              "everyone",
              registry.execute('PLAYER_REQUESTS.REMOVE_ALL', makeProps(consumerData))
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('REQUESTS.REMOVE_ALL', makeProps(consumerData))
            );

            addressedResponses.addToBucket(
              "everyone",
              registry.execute('PROPERTY_SETS.GET_ALL_KEYED', makeProps(consumerData))
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('CARDS.GET_ALL_KEYED', makeProps(consumerData))
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('PLAYERS.GET', makeProps(consumerData))
            );
            addressedResponses.addToBucket(
              "default",
              registry.execute('PLAYER_HANDS.GET_KEYED', makeProps(consumerData, specificPropsForEveryone))
            );
            addressedResponses.addToBucket(
              "default",
              registry.execute('PLAYER_BANKS.GET_KEYED', makeProps(consumerData, specificPropsForEveryone))
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('COLLECTIONS.GET_ALL_KEYED', makeProps(consumerData, {peopleIds}))
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('PLAYER_COLLECTIONS.GET_ALL_KEYED', makeProps(consumerData, {peopleIds}))
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('DRAW_PILE.GET', makeProps(consumerData))
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('ACTIVE_PILE.GET', makeProps(consumerData))
            );

            addressedResponses.addToBucket(
              "everyone",
              registry.execute('DISCARD_PILE.GET', makeProps(consumerData))
            );

            addressedResponses.addToBucket(
              "everyone",
              registry.execute('GAME.STATUS', makeProps(consumerData))
            );

            addressedResponses.addToBucket(
              "everyone",
              makeResponse({
                subject,
                action,
                status: "success",
                payload: null,
              })
            );
            addressedResponses.addToBucket(
              "everyone",
              registry.execute('PLAYER_TURN.GET', makeProps(consumerData))
            );
          }
          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    registry.public(`GAME.CAN_START`, (props) => {
      // roomCode
      const [subject, action] = ["GAME", "CAN_START"];
      const addressedResponses = new AddressedResponse();
      return handlePerson(props, ({ room, personManager }) => {
          let game = room.getGame();
          let canStart = canGameStart(game, personManager);
          let host = personManager.findPerson((person) =>
            person.hasTag("host")
          );
          if (isDef(host)) {
            let status = "success";
            let payload = {
              value: canStart,
            };
            addressedResponses.addToSpecific(
              host.getClientId(),
              makeResponse({ subject, action, status, payload })
            );
          }
          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    
    registry.public(`PLAYER_TURN.GET`, (props) => {
      let subject = "PLAYER_TURN";
      let action = "GET";
      const addressedResponses = new AddressedResponse();
      return handleGame(
        props,
        (consumerData) => {
          let { game, thisPersonId } = consumerData;
          let currentTurn = game.getCurrentTurn();

          if (currentTurn.getPhaseKey() === "discard") {
            let thisPlayerHand = game.getPlayerHand(thisPersonId);
            let remaining =
              thisPlayerHand.getCount() - game.getHandMaxCardCount();
            if (remaining > 0) {
              currentTurn.setPhaseData({
                remainingCountToDiscard: remaining,
              });
            }
          }

          let payload = game.getCurrentTurn().serialize();

          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status: "success", payload })
          );

          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    
    // Add From Hand
    registry.public('MY_TURN.ADD_CARD_TO_MY_BANK_FROM_HAND', buildAddCardToBankAction({
      ...commonDeps,
      registry,
      makeConsumerFallbackResponse,
      makeResponse,
      packageCheckpoints,
      handCardConsumer,
      log,
    })
  )
    registry.public('MY_TURN.ADD_PROPERTY_TO_NEW_COLLECTION_FROM_HAND', buildAddPropertyToNewCollectionAction({
        ...commonDeps,
        registry,
        makeConsumerFallbackResponse,
        makeResponse,
        packageCheckpoints,
        handCardConsumer,
        log,
      })
    )
    registry.public('MY_TURN.ADD_PROPERTY_TO_EXISTING_COLLECTION_FROM_HAND', buildAddPropertyToExitingCollectionAction({
        ...commonDeps,
        registry,
        makeConsumerFallbackResponse,
        makeResponse,
        packageCheckpoints,
        handCardConsumer,
        log,
      })
    )
    registry.public('MY_TURN.ADD_SET_AUGMENT_TO_EXISTING_COLLECTION_FROM_HAND', buildAddSetAugmentToExistingCollectionAction({
        ...commonDeps,
        registry,
        makeConsumerFallbackResponse,
        makeResponse,
        packageCheckpoints,
        handCardConsumer,
      })
    )
    registry.public('MY_TURN.TRANSFER_SET_AUGMENT_TO_NEW_COLLECTION_FROM_HAND', buildAddSetAugmentToNewCollectionAction({
        ...commonDeps,
        registry,
        makeConsumerFallbackResponse,
        makeResponse,
        packageCheckpoints,
        handCardConsumer,
        handleMyTurn,
      })
    )

    // Transfer From Collections
    registry.public('MY_TURN.TRANSFER_PROPERTY_TO_NEW_COLLECTION_FROM_COLLECTION', buildTransferPropertyToNewCollectionFromExistingAction({
      ...commonDeps,
      registry,
      makeConsumerFallbackResponse,
      makeResponse,
      packageCheckpoints,
      handCardConsumer,
      handleMyTurn,
    }))
    registry.public('MY_TURN.TRANSFER_PROPERTY_TO_EXISTING_COLLECTION_FROM_COLLECTION', buildTransferPropertyToExistingCollectionFromExistingAction({
      registry,
      makeProps,
      makeConsumerFallbackResponse,
      makeResponse,
      isDef,
      AddressedResponse,
      handleMyTurn,
    }))
    registry.public('MY_TURN.TRANSFER_SET_AUGMENT_TO_EXISTING_COLLECTION_FROM_COLLECTION', buildTransferSetAugmentToExistingCollectionFromExistingAction({
      ...commonDeps,
      registry,
      makeConsumerFallbackResponse,
      makeResponse,
      packageCheckpoints,
      handCardConsumer,
      handleMyTurn,
    }))
    registry.public('MY_TURN.TRANSFER_SET_AUGMENT_TO_NEW_COLLECTION_FROM_COLLECTION', buildTransferSetAugmentToNewCollectionFromExistingAction({
        ...commonDeps,
        registry,
        makeConsumerFallbackResponse,
        makeResponse,
        packageCheckpoints,
        handCardConsumer,
        handleMyTurn,
      }))
      
    // Draw Cards
    registry.public('MY_TURN.PLAY_PASS_GO', buildDrawCardsAction({
      ...commonDeps,
      registry,
      makeConsumerFallbackResponse,
      makeResponse,
      handCardConsumer,
    }))

    // Card Manipulation
    registry.public('MY_TURN.CHANGE_CARD_ACTIVE_SET', buildChangeCardActiveSetAction({
      ...commonDeps,
      registry,
      makeResponse,
      handleMyTurn,
      makeConsumerFallbackResponse,
      packageCheckpoints,
      makeResponse,
    }))

    // REACT WITH JUST_SAY_NO
    registry.public(`RESPONSES.RESPOND_TO_JUST_SAY_NO`, buildRespondToJustSayNoAction({
      ...commonDeps,
      registry,
      makeConsumerFallbackResponse,
      makeResponse,
      handleGame, 
      handleTransactionResponse,
    }))
    // STEAL COLLECTION
    registry.public(`MY_TURN.STEAL_COLLECTION`, buildStealCollectionAction({
      ...commonDeps,
      registry,
      handleRequestCreation,
    }))
    registry.public(`RESPONSES.RESPOND_TO_STEAL_COLLECTION`, buildRespondToStealCollection({
          ...commonDeps,
          registry,
          handleTransactionResponse,
        }))
    // STEAL_PROPERTY
    registry.public(`MY_TURN.STEAL_PROPERTY`, buildStealPropertyAction({
      ...commonDeps,
      registry,
      handleRequestCreation,
    }))
    registry.public(`RESPONSES.RESPOND_TO_STEAL_PROPERTY`, buildRespondToStealPropertyAction({
      ...commonDeps,
      registry,
      handleTransactionResponse,
    }) )
    // SWAP_PROPERTY
    registry.public(`MY_TURN.SWAP_PROPERTY`, buildSwapPropertyAction({
      ...commonDeps,
      registry,
      handleRequestCreation,
    }) )
    registry.public(`RESPONSES.RESPOND_TO_PROPERTY_SWAP`, buildRespondToPropertySwapAction({
      ...commonDeps,
      registry,
      handleTransactionResponse
    }))
    // Turn based
    registry.public(`MY_TURN.TURN_STARTING_DRAW`, buildTurnStartingDrawAction({
      ...commonDeps,
      registry,
      AddressedResponse,
      makeConsumerFallbackResponse,
      handleMyTurn,
      makeResponse,
    }))
    registry.public(`MY_TURN.FINISH_TURN`, buildAttemptFinishTurnAction({
      ...commonDeps,
      registry,
      AddressedResponse,
      makeConsumerFallbackResponse,
      handleMyTurn,
      makeResponse,
      makeProps,
    }))
    registry.public(`MY_TURN.DISCARD_REMAINING`, buildDiscardToHandLimitAction({
      ...commonDeps,
      registry,
      AddressedResponse,
      makeConsumerFallbackResponse,
      handleMyTurn,
      makeResponse,
      makeProps,
      els,
    }) )

    // COLLECT CARDS
    registry.public(`RESPONSES.ACKNOWLEDGE_COLLECT_NOTHING`, buildAcknowledgeCollectNothingAction({
      ...commonDeps,
      registry,
      handleTransactionResponse
    }))
    registry.public(`RESPONSES.COLLECT_CARD_TO_BANK_AUTO`, buildCollectCardToBankAutoAction({
      ...commonDeps,
      registry,
      handleTransferResponse,
    }))
    registry.public(`RESPONSES.COLLECT_CARD_TO_BANK`, buildCollectCardToBankAction({
      ...commonDeps,
      registry,
      handleTransferResponse,
    }) )
    registry.public(`RESPONSES.COLLECT_CARD_TO_COLLECTION`, buildCollectCardToCollectionAction({
      ...commonDeps,
      registry,
      handleTransferResponse,
    }) )
    registry.public(`RESPONSES.COLLECT_COLLECTION`, buildCollectCollectionAction({
      ...commonDeps,
      registry,
      handleTransferResponse
    }) )
        
    // Piles
    registry.public(`DISCARD_PILE.GET`, (props) => {
      let subject = "DISCARD_PILE";
      let action = "GET";
      const addressedResponses = new AddressedResponse();
      return handleGame(
        props,
        (props2) => {
          let { game } = props2;
          let payload = game.getDiscardPile().serialize();
          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status: "success", payload })
          );

          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    registry.public(`ACTIVE_PILE.GET`, (props) => {
      let subject = "ACTIVE_PILE";
      let action = "GET";
      const addressedResponses = new AddressedResponse();
      return handleGame(
        props,
        (props2) => {
          let { game } = props2;
          let payload = game.getActivePile().serialize();
          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status: "success", payload })
          );

          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    registry.public(`DRAW_PILE.GET`, (props) => {
      let subject = "DRAW_PILE";
      let action = "GET";
      const addressedResponses = new AddressedResponse();
      return handleGame(
        props,
        ({ game }) => {
          // Takes no action
          // Current count of card in deck
          let payload = {
            count: game.getDeckCardCount(),
          };
          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status: "success", payload })
          );
          //___________________________________________________________
          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    
    registry.public(`PLAYER_REQUESTS.GET_KEYED`, (props) => {
      //props: { roomCode, (peopleIds|personId)}
      let subject = "PLAYER_REQUESTS";
      let action = "GET_KEYED";
      const addressedResponses = new AddressedResponse();
      return handleGame(
        props,
        (consumerData) => {
          let { game } = consumerData;

          let myKeyedRequest = KeyedRequest();
          myKeyedRequest.setAction(action);
          myKeyedRequest.setSubject(subject);
          myKeyedRequest.setPluralKey("peopleIds");
          myKeyedRequest.setSingularKey("personId");
          myKeyedRequest.setDataFn((personId) => {
            return game
              .getRequestManager()
              .getAllRequestIdsForPlayer(personId);
          });
          myKeyedRequest.setProps(consumerData);

          //deliver data
          addressedResponses.addToBucket(
            "default",
            makeKeyedResponse(myKeyedRequest)
          );

          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    registry.public(`PLAYER_REQUESTS.REMOVE_ALL`, (props) => {
      let subject = "REQUESTS";
      let action = "PLAYER_REQUESTS";
      let status = "failure";
      let payload = null;
      const addressedResponses = new AddressedResponse();
      return handleGame(
        props,
        (consumerData) => {
          status = "success";
          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status, payload })
          );
          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    })
    
    
    let requestStuff = makeRegularGetKeyed({
      subject: "REQUESTS",
      singularKey: "requestId",
      pluralKey: "requestIds",
      makeGetDataFn: ({ game, subject, action }, checkpoints) => (
        requestId
      ) => {
        let result = null;
        let data = game
          .getCurrentTurn()
          .getRequestManager()
          .getRequest(requestId);

        if (isDef(data)) {
          checkpoints.set("requestExists", true);
          result = data.serialize();
        }
        return result;
      },
      makeGetAllKeysFn: ({ game, subject, action }, checkpoints) => () => {
        let result = game
          .getCurrentTurn()
          .getRequestManager()
          .getAllRequestIds();
        return result;
      },
      makeGetAlMyKeysFn: (
        { game, thisPersonId, subject, action },
        checkpoints
      ) => () => {
        let result = game
          .getCurrentTurn()
          .getRequestManager()
          .getAllRequestIdsForPlayer(thisPersonId);
        return result;
      },
    })
    registry.public(`REQUESTS.GET_KEYED`, requestStuff.GET_KEYED);
    registry.public(`REQUESTS.GET_ALL_KEYED`, requestStuff.GET_ALL_KEYED);
    registry.public(`REQUESTS.GET_ALL_MY_KEYED`, requestStuff.GET_ALL_MY_KEYED);
    registry.public(`REQUESTS.REMOVE_KEYED`, requestStuff.REMOVE_KEYED);
    registry.public(`REQUESTS.REMOVE_ALL`, (props) => {
      let subject = "REQUESTS";
      let action = "REMOVE_ALL";
      let status = "failure";
      let payload = null;
      const addressedResponses = new AddressedResponse();
      return handleGame(
        props,
        (consumerData) => {
          status = "success";
          addressedResponses.addToBucket(
            "default",
            makeResponse({ subject, action, status, payload })
          );
          return addressedResponses;
        },
        makeConsumerFallbackResponse({ subject, action, addressedResponses })
      );
    });

  }
}
