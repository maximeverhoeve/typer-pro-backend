"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chatHandler = (socket) => {
    // EVENT-FUNCTIONS
    const onSendMessage = ({ message, nickname, room }) => {
        socket.to(room).emit('chat:receive', { message, nickname });
        socket.emit('chat:receive', { message, nickname });
    };
    // EVENTS
    socket.on('chat:send', onSendMessage);
};
exports.default = chatHandler;
//# sourceMappingURL=chatHandler.js.map