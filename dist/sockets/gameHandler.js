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
const playerHandler = (socket) => {
    // EVENT-FUNCTIONS
    const onReadyUpate = (isReady) => {
        console.log(`Is ${socket.data.nickname} ready? ${isReady ? 'Yes' : 'no'}`);
        socket.data.player.isReady = isReady;
        const players = (0, server_1.getPlayerArray)(socket.data.room);
        socket.emit('room:update', players);
        socket.to(socket.data.room).emit('room:update', players);
    };
    const onPlayerUpdate = ({ color }) => {
        console.log(`Player ${socket.data.nickname} updated color to ${color}`);
        socket.data.player.color = color;
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
//# sourceMappingURL=gameHandler.js.map