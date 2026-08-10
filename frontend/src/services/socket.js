import { io } from 'socket.io-client';
import { API_URL } from './api';

const socket = io(API_URL, {
  autoConnect: false, // We'll connect manually after login
});

export default socket;
