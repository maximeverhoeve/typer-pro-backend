import {
  ClientToServerEvents,
  InterServerEvents,
  Player,
  ServerToClientEvents,
  SocketData,
} from './types/socketTypes';
import * as express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors';
import html from './constants/html';
import chatHandler from './sockets/chatHandler';
import roomHandler from './sockets/roomHandler';
import playerHandler from './sockets/playerHandler';

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
>(httpServer, {
  transports: ['websocket'],
  cors: { origin: 'https://admin.socket.io' },
});

export const getPlayerArray = (room: string): Player[] => {
  const clientIdsInRoom = io.sockets.adapter.rooms.get(room);
  const players: Player[] = [];
  clientIdsInRoom?.forEach((id: string) => {
    const clientSocket = io.sockets.sockets.get(id);
    if (clientSocket?.data?.nickname) players.push(clientSocket.data.player);
  });
  return players;
};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // HANDLE CHAT
  chatHandler(socket);

  // HANDLE ROOM
  roomHandler(socket, io);

  // HANDLE Player
  playerHandler(socket);

  // ON DISCONNECT
  const onDisconnect = (): void => {
    if (socket.data.room && socket.data.nickname) {
      // Send message to room that user left it
      socket.to(socket.data.room).emit('chat:receive', {
        message: '---- left the room',
        nickname: socket.data.nickname,
      });

      // update room
      const players = getPlayerArray(socket.data.room);
      socket.to(socket.data.room).emit('room:update', players);
    }

    // log to server
    console.log(
      `User ${socket.data.nickname || socket.id} disconnected ${
        socket.data.room ? 'from room: ' + socket.data.room : ''
      }`,
    );
  };

  // EVENTS
  socket.on('disconnect', onDisconnect);
});

app.get('/', (req, res) => res.type('html').send(html));

httpServer.listen(port, () => {
  console.log('SERVER IS RUNNING DEVMAX');
});

export { io };
