const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env from root
require('dotenv').config(); // Also try local .env as fallback
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const messageRoutes = require('./routes/messages');
const chatSockets = require('./sockets/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity in development
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/messages', messageRoutes);

// Socket.io setup
chatSockets(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
