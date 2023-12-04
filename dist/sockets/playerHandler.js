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
];
// Define interval so we can cancel it outside of events
let countdownInterval;
const playerHandler = (socket) => {
    // HELPER FUNCTIONS
    const checkAllPlayerStatus = (roomId, players) => {
        let countdownDuration = 5;
        const isAllReady = players.every(({ isReady }) => isReady);
        if (isAllReady) {
            countdownInterval = setInterval(() => {
                socket.to(roomId).emit('room:update-countdown', countdownDuration);
                countdownDuration--;
                if (countdownDuration < 0) {
                    clearInterval(countdownInterval);
                    socket.to(roomId).emit('room:countdown-ended');
                }
            }, 1000);
        }
        else {
            clearInterval(countdownInterval);
        }
    };
    // EVENT-FUNCTIONS
    const onReadyUpate = (isReady) => {
        console.log(`Is ${socket.data.nickname} ready? ${isReady ? 'Yes' : 'no'}`);
        socket.data.player.isReady = isReady;
        const players = (0, server_1.getPlayerArray)(socket.data.room);
        // handle all players ready
        checkAllPlayerStatus(socket.data.room, players);
        socket.emit('room:update', players);
        socket.to(socket.data.room).emit('room:update', players);
    };
    const onPlayerUpdate = (payload) => {
        console.log(`Player ${socket.data.nickname} updated  ${JSON.stringify(payload)}`);
        socket.data.player = Object.assign(Object.assign({}, socket.data.player), payload);
        const players = (0, server_1.getPlayerArray)(socket.data.room);
        socket.emit('room:update', players);
        socket.to(socket.data.room).emit('room:update', players);
    };
    const onGameStart = () => {
        const text = wordArray.join(' ');
        socket.emit('game:started', text);
        socket.to(socket.data.room).emit('game:started', text);
    };
    const onProgressUpdate = (progress) => {
        socket.data.player.progress = progress;
        const players = (0, server_1.getPlayerArray)(socket.data.room);
        socket.emit('room:update', players);
        socket.to(socket.data.room).emit('room:update', players);
    };
    // EVENTS
    socket.on('player:update-ready', onReadyUpate);
    socket.on('player:update', onPlayerUpdate);
    socket.on('player:progress', onProgressUpdate);
    socket.on('game:start', onGameStart);
};
exports.default = playerHandler;
//# sourceMappingURL=playerHandler.js.map