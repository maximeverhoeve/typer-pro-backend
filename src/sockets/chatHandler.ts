import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  Message,
  ServerToClientEvents,
  SocketData,
} from 'socketTypes';

const chatHandler = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
): void => {
  // EVENT-FUNCTIONS
  const onSendMessage = ({ message, nickname, room }: Message): void => {
    socket.to(room).emit('chat:receive', { message, nickname });
    socket.emit('chat:receive', { message, nickname });
  };

  // EVENTS
  socket.on('chat:send', onSendMessage);
};

export default chatHandler;
