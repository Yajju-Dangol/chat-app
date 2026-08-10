const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase JS Client initialized.');
} else {
  console.log('No SUPABASE_URL or SUPABASE_ANON_KEY found. Using mock database.');
}

// In-memory mock fallback
const mockMessages = [];
const mockUsers = [];

const db = {
  // Register a new user with hashed password
  async registerUser(username, password) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    if (supabase) {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existing) {
        throw { status: 409, message: 'Username already taken' };
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{ username, password_hash, is_online: false }])
        .select('id, username, created_at')
        .single();

      if (error) {
        console.error('Error registering user:', error);
        throw error;
      }
      return data;
    } else {
      if (mockUsers.find(u => u.username === username)) {
        throw { status: 409, message: 'Username already taken' };
      }
      const user = { id: Date.now().toString(), username, password_hash, created_at: new Date().toISOString() };
      mockUsers.push(user);
      return { id: user.id, username: user.username, created_at: user.created_at };
    }
  },

  // Login: verify username + password
  async loginUser(username, password) {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, password_hash, created_at')
        .eq('username', username)
        .single();

      if (error || !data) {
        throw { status: 401, message: 'Invalid username or password' };
      }

      const isMatch = await bcrypt.compare(password, data.password_hash);
      if (!isMatch) {
        throw { status: 401, message: 'Invalid username or password' };
      }

      return { id: data.id, username: data.username, created_at: data.created_at };
    } else {
      const user = mockUsers.find(u => u.username === username);
      if (!user) throw { status: 401, message: 'Invalid username or password' };
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) throw { status: 401, message: 'Invalid username or password' };
      return { id: user.id, username: user.username, created_at: user.created_at };
    }
  },

  async getUsers() {
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('username, is_online, last_seen')
        .order('username', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return data;
    } else {
      return mockUsers.map(u => ({ username: u.username, is_online: true }));
    }
  },

  async addMessage({ sender_username, recipient_username, content, status = 'sent' }) {
    if (supabase) {
      console.log('Inserting message:', { sender_username, recipient_username, content });
      const { data, error } = await supabase
        .from('messages')
        .insert([{ sender_username, recipient_username, content, status }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting message:', JSON.stringify(error, null, 2));
        throw error;
      }
      console.log('Message saved:', data.id);
      return data;
    } else {
      const msg = {
        id: Math.random().toString(36).substring(7),
        sender_username, recipient_username, content, status,
        created_at: new Date().toISOString()
      };
      mockMessages.push(msg);
      return msg;
    }
  },

  async getMessages(user1, user2) {
    if (supabase) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_username.eq.${user1},recipient_username.eq.${user2}),and(sender_username.eq.${user2},recipient_username.eq.${user1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      return data;
    } else {
      return mockMessages.filter(m =>
        (m.sender_username === user1 && m.recipient_username === user2) ||
        (m.sender_username === user2 && m.recipient_username === user1)
      );
    }
  }
};

module.exports = db;
