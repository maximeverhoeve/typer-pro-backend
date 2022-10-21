const express = require('express');
const http = require('http');
const app = express();
const { Server } = require('socket.io');
const port = process.env.PORT || 3001;


// Prevent some possible connection errors with cors
const cors = require('cors');
const html = require('./constants/html');
app.use(cors());

const httpServer = http.createServer(app);


// SETUP IO SERVER
const io = module.exports.io = new Server(httpServer)

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id)
  // ON SEND MESSAGE
  socket.on('send_message', ({ message, nickname, room }) => {
    socket.to(room).emit('receive_message', { message, nickname })
    socket.emit('receive_message', { message, nickname: nickname})
  })

  // ON JOIN ROOM
  socket.on('join_room', ({ room, nickname }) => {
    
    socket.room = room;
    socket.nickname = nickname;
    console.log(`User "${nickname}" joined room: "${room}"`)
    socket.join(room);
    const clientIdsInRoom =  io.sockets.adapter.rooms.get(room);
    const players = [];
    clientIdsInRoom.forEach((id) => {
      const clientSocket = io.sockets.sockets.get(id);
      players.push(clientSocket.nickname);
    }); 
    socket.emit('room_joined', {room, nickname});

    socket.emit('receive_message', {message: `---- joined ${room}`, nickname});
    socket.to(room).emit('receive_message', {message: `---- joined ${room}`, nickname});
    
    socket.emit('room_updated', players);
    socket.to(room).emit('room_updated', players);
  })

  // ON LEFT ROOM
  socket.on('leave_room', () => {
    socket.to(socket.room).emit('receive_message', {message: `---- left the room`, nickname: socket.nickname});
    socket.leave(socket.room);
    socket.room = undefined;
    socket.emit('room_left');
  })

  // ON DISCONNECT
  socket.on('disconnect', () => {
    if (socket.room) {
      // Send message to room that user left it
      socket.to(socket.room).emit('receive_message', {message: `---- left the room`, nickname: socket.nickname});
    }

    // log to server
    console.log(`User ${socket.nickname || socket.id } disconnected ${socket.room ? 'from room: ' + socket.room : ''}`);
  })

})

app.get("/", (req, res) => res.type('html').send(html));

httpServer.listen(port, () => {
  console.log('SERVER IS RUNNING DEVMAX');
})