const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// In-memory data store for users
const users = {};

// Serve static files from the "public" directory
app.use(express.static('public'));

// Handle new socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user login
  socket.on('login', (data) => {
    const { name, color } = data;
    users[socket.id] = { name, color };
    socket.broadcast.emit('userJoined', { id: socket.id, name, color });
  });

  // Handle drawing events
  socket.on('draw', (data) => {
    const { stroke, color } = data;
    socket.broadcast.emit('draw', { stroke, color, userId: socket.id });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      console.log(`${user.name} disconnected`);
      socket.broadcast.emit('userLeft', socket.id);
      delete users[socket.id];
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});