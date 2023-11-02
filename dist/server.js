"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.getPlayerArray = void 0;
const express = require("express");
const http = require("http");
const socket_io_1 = require("socket.io");
const cors = require("cors");
const html_1 = require("./constants/html");
const chatHandler_1 = require("./sockets/chatHandler");
const roomHandler_1 = require("./sockets/roomHandler");
const playerHandler_1 = require("./sockets/playerHandler");
const app = express();
const port = process.env.PORT || 3001;
// Prevent some possible connection errors with cors
app.use(cors());
const httpServer = http.createServer(app);
// SETUP IO SERVER
const io = new socket_io_1.Server(httpServer, {
    transports: ['websocket'],
    cors: { origin: 'https://admin.socket.io' },
});
exports.io = io;
const getPlayerArray = (room) => {
    const clientIdsInRoom = io.sockets.adapter.rooms.get(room);
    const players = [];
    clientIdsInRoom === null || clientIdsInRoom === void 0 ? void 0 : clientIdsInRoom.forEach((id) => {
        var _a;
        const clientSocket = io.sockets.sockets.get(id);
        if ((_a = clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.data) === null || _a === void 0 ? void 0 : _a.nickname)
            players.push(clientSocket.data.player);
    });
    return players;
};
exports.getPlayerArray = getPlayerArray;
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    // HANDLE CHAT
    (0, chatHandler_1.default)(socket);
    // HANDLE ROOM
    (0, roomHandler_1.default)(socket, io);
    // HANDLE Player
    (0, playerHandler_1.default)(socket);
    // ON DISCONNECT
    const onDisconnect = () => {
        if (socket.data.room && socket.data.nickname) {
            // Send message to room that user left it
            socket.to(socket.data.room).emit('chat:receive', {
                message: '---- left the room',
                nickname: socket.data.nickname,
            });
            // update room
            const players = (0, exports.getPlayerArray)(socket.data.room);
            socket.to(socket.data.room).emit('room:update', players);
        }
        // log to server
        console.log(`User ${socket.data.nickname || socket.id} disconnected ${socket.data.room ? 'from room: ' + socket.data.room : ''}`);
    };
    // EVENTS
    socket.on('disconnect', onDisconnect);
});
app.get('/', (req, res) => res.type('html').send(html_1.default));
httpServer.listen(port, () => {
    console.log('SERVER IS RUNNING DEVMAX');
});
//# sourceMappingURL=server.js.map