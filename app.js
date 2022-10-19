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
const io = module.exports.io = new Server(httpServer, {
  
})

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  // ON SEND MESSAGE
  socket.on('send_message', ({ message, nickname, room }) => {
    socket.to(room).emit('receive_message', { message, nickname })
    socket.emit('receive_message', { message, nickname: nickname})
  })

  // ON JOIN ROOM
  socket.on('join_room', ({ room, nickname }) => {
    console.log(`User "${nickname}" joined room: "${room}"`)
    socket.join(room);
    socket.emit('room_joined', {room, nickname});
    socket.emit('receive_message', {message: `---- joined ${room}`, nickname});
    socket.to(room).emit('receive_message', {message: `---- joined ${room}`, nickname});
  })
  socket.on('disconnect', () => {
    console.log('User disconnected with id:', socket.id);
  })

  // ON DISCONNECT EVENT
  socket.on('disconnect_user', () => {
    console.log('disconnect')
    socket.disconnect();
  })
})

app.get("/", (req, res) => res.type('html').send(html));

httpServer.listen(port, () => {
  console.log('SERVER IS RUNNING DEVMAX');
})