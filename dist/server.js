"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express = require("express");
const http = require("http");
const socket_io_1 = require("socket.io");
const cors = require("cors");
const html_1 = require("./constants/html");
const app = express();
const port = process.env.PORT || 3001;
// Prevent some possible connection errors with cors
app.use(cors());
const httpServer = http.createServer(app);
// SETUP IO SERVER
const io = new socket_io_1.Server(httpServer);
exports.io = io;
const getPlayerArray = (room) => {
    const clientIdsInRoom = io.sockets.adapter.rooms.get(room);
    const players = [];
    clientIdsInRoom === null || clientIdsInRoom === void 0 ? void 0 : clientIdsInRoom.forEach((id) => {
        var _a;
        const clientSocket = io.sockets.sockets.get(id);
        if ((_a = clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.data) === null || _a === void 0 ? void 0 : _a.nickname)
            players.push(clientSocket.data.nickname);
    });
    return players;
};
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    // ON SEND MESSAGE
    socket.on('send_message', ({ message, nickname, room }) => {
        socket.to(room).emit('receive_message', { message, nickname });
        socket.emit('receive_message', { message, nickname });
    });
    // ON JOIN ROOM
    socket.on('join_room', ({ room, nickname }) => __awaiter(void 0, void 0, void 0, function* () {
        socket.data.room = room;
        socket.data.nickname = nickname;
        console.log(`User "${nickname}" joined room: "${room}"`);
        yield socket.join(room);
        const players = getPlayerArray(room);
        socket.emit('room_joined', { room, nickname });
        socket.emit('receive_message', { message: `---- joined ${room}`, nickname });
        socket.to(room).emit('receive_message', { message: `---- joined ${room}`, nickname });
        socket.emit('room_updated', players);
        socket.to(room).emit('room_updated', players);
    }));
    // ON LEFT ROOM
    socket.on('leave_room', () => __awaiter(void 0, void 0, void 0, function* () {
        if (socket.data.room && socket.data.nickname) {
            socket.to(socket.data.room).emit('receive_message', { message: '---- left the room', nickname: socket.data.nickname });
            const players = getPlayerArray(socket.data.room);
            socket.to(socket.data.room).emit('room_updated', players);
            yield socket.leave(socket.data.room);
            socket.data.room = undefined;
            socket.emit('room_left');
        }
    }));
    // ON DISCONNECT
    socket.on('disconnect', () => {
        if (socket.data.room && socket.data.nickname) {
            // Send message to room that user left it
            socket.to(socket.data.room).emit('receive_message', { message: '---- left the room', nickname: socket.data.nickname });
        }
        // log to server
        console.log(`User ${socket.data.nickname || socket.id} disconnected ${socket.data.room ? 'from room: ' + socket.data.room : ''}`);
    });
});
app.get('/', (req, res) => res.type('html').send(html_1.default));
httpServer.listen(port, () => {
    console.log('SERVER IS RUNNING DEVMAX');
});
//# sourceMappingURL=server.js.map