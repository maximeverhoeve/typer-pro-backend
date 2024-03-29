import { Socket, Server } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  RoomStateStats,
  ServerToClientEvents,
  SocketData,
} from 'socketTypes';
import { getPlayerArray } from '../server';
import RoomStates from '../classes/RoomStates';

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
  roomStates: RoomStates,
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
      isLoaded: false,
      progress: 0,
      id: socket.id,
      color: '#888d8a',
    };

    // ----
    await socket.join(room);
    console.log(`User "${nickname}" joined room: "${room}"`);

    /** Send rooms update to client  */
    onRoomsRequest();

    const players = getPlayerArray(room);
    socket.emit('room:joined', { room, nickname });
    socket.emit('room:update', players);
    socket.to(room).emit('room:update', players);

    /** Create room state object */
    const roomState = roomStates.getRoomState(room);
    if (!roomState) {
      roomStates.addRoomState(room);
    }
  };

  // ----- LEAVE ROOM
  const onRoomLeave = async (): Promise<void> => {
    if (socket.data.room && socket.data.nickname) {
      await socket.leave(socket.data.room);
      const players = getPlayerArray(socket.data.room);
      if (players.length === 1) players[0].isReady = false;
      if (players.length === 0) roomStates.removeRoomState(socket.data.room);
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

  const onRoomFinished = (stats: RoomStateStats): void => {
    const roomState = roomStates.getRoomState(socket.data.room);
    if (roomState) {
      roomState.addToLeaderboard(socket.id, {
        ...stats,
        name: socket.data.nickname,
      });
    }
  };

  // EVENTS
  socket.on('room:join', onRoomJoin);
  socket.on('room:leave', onRoomLeave);
  socket.on('room:request', onRoomRequest);
  socket.on('room:finished', onRoomFinished);
  socket.on('rooms:request', onRoomsRequest);
};

export default roomHandler;
