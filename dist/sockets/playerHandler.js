"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const wordArray = [
    'geez',
    'uncustomary',
    'precipitants',
    'amalgamators',
    'yasmaks',
    'titrating',
    'tinmen',
    'lady',
    'allelopathy',
    'wrote',
    'diplegias',
    'naturopathies',
    'fishbowl',
    'allying',
    'confessions',
    'potstones',
    'mussily',
    'pickoff',
    'foreigner',
    'dysuric',
    'perikarya',
    'madreporites',
    'grabbling',
    'councilwomen',
    'darkeners',
    'atriums',
    'beachwear',
    'obturators',
    'depravednesses',
    'practicability',
    'perdurabilities',
    'surrealists',
    'acaricides',
    'kobos',
    'frounces',
    'achievements',
    'bridegroom',
    'cratered',
    'craven',
    'bivalve',
    'canst',
    'moperies',
    'edifies',
    'hydroxides',
    'asphyxy',
    'elaborately',
    'cavalero',
    'privatise',
    'petulancy',
    'nagger',
];
const playerHandler = (socket) => {
    // EVENT-FUNCTIONS
    const onReadyUpate = (isReady) => {
        console.log(`Is ${socket.data.nickname} ready? ${isReady ? 'Yes' : 'no'}`);
        socket.data.player.isReady = isReady;
        const players = (0, server_1.getPlayerArray)(socket.data.room);
        socket.emit('room:update', players);
        socket.to(socket.data.room).emit('room:update', players);
    };
    const onGameStart = () => {
        const text = wordArray.join(' ');
        socket.emit('game:started', text);
        socket.to(socket.data.room).emit('game:started', text);
    };
    // EVENTS
    socket.on('player:update-ready', onReadyUpate);
    socket.on('game:start', onGameStart);
};
exports.default = playerHandler;
//# sourceMappingURL=playerHandler.js.map