import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from 'socketTypes';
import { getPlayerArray } from '../server';

const playerHandler = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
): void => {
  // EVENT-FUNCTIONS
  const onReadyUpate = (isReady: boolean): void => {
    console.log(`Is ${socket.data.nickname} ready? ${isReady ? 'Yes' : 'no'}`);
    socket.data.player.isReady = isReady;
    const players = getPlayerArray(socket.data.room);

    socket.emit('room:update', players);
    socket.to(socket.data.room).emit('room:update', players);
  };

  // EVENTS
  socket.on('player:update-ready', onReadyUpate);
};

export default playerHandler;
