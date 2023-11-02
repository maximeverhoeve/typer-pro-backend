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
const server_1 = require("../server");
const roomHandler = (socket, io) => {
    // EVENT-FUNCTIONS
    // ----- JOIN ROOM
    const onRoomJoin = ({ nickname, room, }) => __awaiter(void 0, void 0, void 0, function* () {
        // SET SOCKET DATA
        socket.data.room = room;
        socket.data.nickname = nickname;
        socket.data.player = {
            nickname,
            isReady: false,
            progress: 0,
            id: socket.id,
        };
        // ----
        console.log(`User "${nickname}" joined room: "${room}"`);
        yield socket.join(room);
        onRoomsRequest();
        const players = (0, server_1.getPlayerArray)(room);
        socket.emit('room:joined', { room, nickname });
        socket.emit('chat:receive', {
            message: `---- joined ${room}`,
            nickname,
        });
        socket
            .to(room)
            .emit('chat:receive', { message: `---- joined ${room}`, nickname });
        socket.emit('room:update', players);
        socket.to(room).emit('room:update', players);
    });
    // ----- LEAVE ROOM
    const onRoomLeave = () => __awaiter(void 0, void 0, void 0, function* () {
        if (socket.data.room && socket.data.nickname) {
            socket.to(socket.data.room).emit('chat:receive', {
                message: '---- left the room',
                nickname: socket.data.nickname,
            });
            yield socket.leave(socket.data.room);
            const players = (0, server_1.getPlayerArray)(socket.data.room);
            if (players.length === 1)
                players[0].isReady = false;
            socket.emit('room:update', players);
            socket.to(socket.data.room).emit('room:update', players);
            socket.data.room = undefined;
            socket.emit('room:left');
            onRoomsRequest();
        }
    });
    // ----- SEND ROOM DATA
    const onRoomRequest = (room) => {
        const players = (0, server_1.getPlayerArray)(room);
        socket.emit('room:update', players);
    };
    // ----- GET ALL ROOMS
    const onRoomsRequest = () => {
        const rooms = Array.from(io.sockets.adapter.rooms);
        const roomsMap = rooms.map(([name, players]) => ({
            name,
            count: players.size,
        }));
        socket.broadcast.emit('rooms:get', roomsMap);
    };
    // EVENTS
    socket.on('room:join', onRoomJoin);
    socket.on('room:leave', onRoomLeave);
    socket.on('room:request', onRoomRequest);
    socket.on('rooms:request', onRoomsRequest);
};
exports.default = roomHandler;
//# sourceMappingURL=roomHandler.js.map