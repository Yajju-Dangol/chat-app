const db = require('../db');

// Keep track of connected users: socket.id -> username
const socketIdToUsername = new Map();
// Keep track of username -> socket.id (for private messaging)
const usernameToSocketId = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user login (dummy auth)
    socket.on('user_join', async (username) => {
      socketIdToUsername.set(socket.id, username);
      usernameToSocketId.set(username, socket.id);
      
      console.log(`${username} joined with socket ${socket.id}`);
      
      // Ensure user exists in DB
      try {
        await db.createUser(username);
      } catch (err) {
        console.error('Failed to create user in DB:', err);
      }
      
      // Broadcast that a user came online
      io.emit('user_status', { username, status: 'online' });
    });

    // Handle sending a private message
    socket.on('send_message', async (data) => {
      try {
        const { sender_username, recipient_username, content } = data;
        
        // Save to database
        const savedMessage = await db.addMessage({ sender_username, recipient_username, content, status: 'sent' });
        
        // Send to recipient if they are online
        const recipientSocketId = usernameToSocketId.get(recipient_username);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', savedMessage);
        }
        
        // Also send back to sender for acknowledgment (so they see it immediately)
        socket.emit('receive_message', savedMessage);
      } catch (error) {
        console.error('Socket error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('user_typing', (data) => {
      const { recipient_username, isTyping } = data;
      const recipientSocketId = usernameToSocketId.get(recipient_username);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing_status', { 
          username: socketIdToUsername.get(socket.id), 
          isTyping 
        });
      }
    });

    // Handle message status updates (e.g., read receipts)
    socket.on('message_read', (data) => {
      const { messageId, recipient_username } = data;
      const recipientSocketId = usernameToSocketId.get(recipient_username);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message_status_update', { messageId, status: 'read' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      const username = socketIdToUsername.get(socket.id);
      if (username) {
        // Broadcast offline status
        io.emit('user_status', { username, status: 'offline' });
        socketIdToUsername.delete(socket.id);
        usernameToSocketId.delete(username);
      }
    });
  });
};
