import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from 'socketTypes';
import { getPlayerArray } from '../server';

interface RoomJoinProps {
  nickname: string;
  room: string;
}

const roomHandler = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
): void => {
  // EVENT-FUNCTIONS

  // ----- JOIN ROOM
  const onRoomJoin = async ({
    nickname,
    room,
  }: RoomJoinProps): Promise<void> => {
    socket.data.room = room;
    socket.data.nickname = nickname;
    console.log(`User "${nickname}" joined room: "${room}"`);
    await socket.join(room);
    const players = getPlayerArray(room);
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
  };

  // ----- LEAVE ROOM
  const onRoomLeave = async (): Promise<void> => {
    if (socket.data.room && socket.data.nickname) {
      socket.to(socket.data.room).emit('chat:receive', {
        message: '---- left the room',
        nickname: socket.data.nickname,
      });
      await socket.leave(socket.data.room);
      const players = getPlayerArray(socket.data.room);
      socket.to(socket.data.room).emit('room:update', players);
      socket.data.room = undefined;
      socket.emit('room:left');
    }
  };

  // EVENTS
  socket.on('room:join', onRoomJoin);
  socket.on('room:leave', onRoomLeave);
};

export default roomHandler;
