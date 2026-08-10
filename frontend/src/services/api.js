import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical device on same network, use your machine's local IP (e.g., 192.168.1.10)
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

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
