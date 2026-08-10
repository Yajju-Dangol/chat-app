import axios from 'axios';
import { Platform } from 'react-native';

// Production: Render hosted backend
// For local development, replace with: 'http://localhost:3000' (or 'http://10.0.2.2:3000' for Android emulator)
export const API_URL = 'https://chat-app-lm6u.onrender.com';

const api = axios.create({
  baseURL: API_URL,
});

export const fetchChatHistory = async () => {
  try {
    const response = await api.get('/api/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export default api;
