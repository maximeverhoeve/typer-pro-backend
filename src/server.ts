import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types/socketTypes';
import * as express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors';
import html from './constants/html';
import chatHandler from './sockets/chatHandler';

const app = express();
const port = process.env.PORT || 3001;

// Prevent some possible connection errors with cors
app.use(cors());

const httpServer = http.createServer(app);

// SETUP IO SERVER
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer);

const getPlayerArray = (room: string): string[] => {
  const clientIdsInRoom = io.sockets.adapter.rooms.get(room);
  const players: string[] = [];
  clientIdsInRoom?.forEach((id: string) => {
    const clientSocket = io.sockets.sockets.get(id);
    if (clientSocket?.data?.nickname) players.push(clientSocket.data.nickname);
  });
  return players;
};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // HANDLE CHAT
  chatHandler(socket);

  // ON JOIN ROOM
  socket.on('room:join', async ({ room, nickname }) => {
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
  });

  // ON LEFT ROOM
  socket.on('room:leave', async () => {
    if (socket.data.room && socket.data.nickname) {
      socket.to(socket.data.room).emit('chat:receive', {
        message: '---- left the room',
        nickname: socket.data.nickname,
      });
      const players = getPlayerArray(socket.data.room);
      socket.to(socket.data.room).emit('room:update', players);
      await socket.leave(socket.data.room);
      socket.data.room = undefined;
      socket.emit('room:left');
    }
  });

  // ON DISCONNECT
  socket.on('disconnect', () => {
    if (socket.data.room && socket.data.nickname) {
      // Send message to room that user left it
      socket.to(socket.data.room).emit('chat:receive', {
        message: '---- left the room',
        nickname: socket.data.nickname,
      });
    }

    // log to server
    console.log(
      `User ${socket.data.nickname || socket.id} disconnected ${
        socket.data.room ? 'from room: ' + socket.data.room : ''
      }`,
    );
  });
});

app.get('/', (req, res) => res.type('html').send(html));

httpServer.listen(port, () => {
  console.log('SERVER IS RUNNING DEVMAX');
});

export { io };
