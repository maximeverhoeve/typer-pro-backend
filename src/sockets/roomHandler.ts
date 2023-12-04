import { Socket, Server } from 'socket.io';
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
  io: Server<
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
    // SET SOCKET DATA
    socket.data.room = room;
    socket.data.nickname = nickname;
    socket.data.player = {
      nickname,
      isReady: false,
      progress: 0,
      id: socket.id,
      color: '#888d8a',
    };

    // ----
    console.log(`User "${nickname}" joined room: "${room}"`);
    await socket.join(room);
    onRoomsRequest();
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
      if (players.length === 1) players[0].isReady = false;
      socket.emit('room:update', players);
      socket.to(socket.data.room).emit('room:update', players);
      socket.data.room = undefined;
      socket.emit('room:left');
      onRoomsRequest();
    }
  };

  // ----- SEND ROOM DATA
  const onRoomRequest = (room: string): void => {
    const players = getPlayerArray(room);
    socket.emit('room:update', players);
  };

  // ----- GET ALL ROOMS
  const onRoomsRequest = (): void => {
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

export default roomHandler;
