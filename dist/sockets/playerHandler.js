"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const playerHandler = (socket) => {
    // EVENT-FUNCTIONS
    const onReadyUpate = (isReady) => {
        console.log(`Is ${socket.data.nickname} ready? ${isReady ? 'Yes' : 'no'}`);
        socket.data.player.isReady = isReady;
        const players = (0, server_1.getPlayerArray)(socket.data.room);
        socket.emit('room:update', players);
        socket.to(socket.data.room).emit('room:update', players);
    };
    // EVENTS
    socket.on('player:update-ready', onReadyUpate);
};
exports.default = playerHandler;
//# sourceMappingURL=playerHandler.js.map