# About

PlayDealGame is an open source implementation of the much loved card game "Monopoly Deal".
This is a rewrite (work in progress) of [PlayDealGameLegacy](https://github.com/ruttyj/PlayDealGameLegacy) my first ever online multiplayer game.

This game will be compatible with free Heroku hosting.

# Current Progress

-   Game Instance
    -   ✔️players
    -   ✔️hands
    -   ✔️banks
    -   ✔️collections
    -   ✔️cards
        -   ✔️currency
        -   ✔️property
        -   ✔️wild cards
        -   ✔️action cards
    -   🟡turns
        -   ✔️turn phases
        -   🟡requests
            -   wealth transfer
            -   counter request
-   Server
    -   Heroku
    -   Listeners
-   Client
    -   React
    -   P5js

# To Run Tests

    cd server/PlayDealGame/tests
    npm install
    npm test
