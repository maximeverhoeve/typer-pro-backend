const express = require('express');
const http = require('http');
const app = express();
const { Server } = require('socket.io');
const port = process.env.PORT || 3001;

const { instrument } = require('@socket.io/admin-ui');

// Prevent some possible connection errors with cors
const cors = require('cors');
const html = require('./constants/html');
app.use(cors());

const httpServer = http.createServer(app);


// SETUP IO SERVER
const io = module.exports.io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
})

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
    socket.emit('room_joined', {room, nickname});
    socket.emit('receive_message', {message: `---- joined ${room}`, nickname});
    socket.to(room).emit('receive_message', {message: `---- joined ${room}`, nickname});
  })

  // ON DISCONNECT
  socket.on('disconnect', () => {
    // Send message to room that user left it
    socket.to(socket.room).emit('receive_message', {message: `---- left the room`, nickname: socket.nickname});

    // log to server
    console.log(`User ${socket.nickname || socket.id } disconnected ${socket.room ? 'from room: ' + socket.room : ''}`);
  })

})

app.get("/", (req, res) => res.type('html').send(html));

httpServer.listen(port, () => {
  console.log('SERVER IS RUNNING DEVMAX');
})

instrument(io, { auth: false});