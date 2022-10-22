import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './types/socketTypes';
import * as express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors';
import html from './constants/html';

const app = express();
const port = process.env.PORT || 3001;

// Prevent some possible connection errors with cors
app.use(cors());

const httpServer = http.createServer(app);

// SETUP IO SERVER
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer);

const getPlayerArray = (room: string): string[] => {
  const clientIdsInRoom = io.sockets.adapter.rooms.get(room);
  const players: string[] = [];
  clientIdsInRoom?.forEach((id: string) => {
    const clientSocket = io.sockets.sockets.get(id);
    if (clientSocket?.data?.nickname) players.push(clientSocket.data.nickname);
  });
  return players;
}

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id)
  // ON SEND MESSAGE
  socket.on('send_message', ({ message, nickname, room }) => {
    socket.to(room).emit('receive_message', { message, nickname })
    socket.emit('receive_message', { message, nickname })
  })

  // ON JOIN ROOM
  socket.on('join_room', async ({ room, nickname }) => {
    socket.data.room = room;
    socket.data.nickname = nickname;
    console.log(`User "${nickname}" joined room: "${room}"`);
    await socket.join(room);
    const players = getPlayerArray(room);
    socket.emit('room_joined', { room, nickname });

    socket.emit('receive_message', { message: `---- joined ${room}`, nickname });
    socket.to(room).emit('receive_message', { message: `---- joined ${room}`, nickname });

    socket.emit('room_updated', players);
    socket.to(room).emit('room_updated', players);
  })

  // ON LEFT ROOM
  socket.on('leave_room', async () => {
    if (socket.data.room && socket.data.nickname) {
      socket.to(socket.data.room).emit('receive_message', { message: '---- left the room', nickname: socket.data.nickname });
      const players = getPlayerArray(socket.data.room);
      socket.to(socket.data.room).emit('room_updated', players);
      await socket.leave(socket.data.room);
      socket.data.room = undefined;
      socket.emit('room_left');
    }
  })

  // ON DISCONNECT
  socket.on('disconnect', () => {
    if (socket.data.room && socket.data.nickname) {
      // Send message to room that user left it
      socket.to(socket.data.room).emit('receive_message', { message: '---- left the room', nickname: socket.data.nickname });
    }

    // log to server
    console.log(`User ${socket.data.nickname || socket.id} disconnected ${socket.data.room ? 'from room: ' + socket.data.room : ''}`);
  })
})

app.get('/', (req, res) => res.type('html').send(html));

httpServer.listen(port, () => {
  console.log('SERVER IS RUNNING DEVMAX');
})

export { io };
