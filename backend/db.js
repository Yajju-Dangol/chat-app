const { createClient } = require('@supabase/supabase-js');

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
const mockUsers = new Set(); // store usernames

const db = {
  async createUser(username) {
    if (supabase) {
      // Try to insert, ignore if already exists (assuming username is UNIQUE in schema)
      const { data, error } = await supabase
        .from('users')
        .insert([{ username, is_online: true }])
        .select()
        .single();
        
      if (error && error.code !== '23505') { // 23505 is unique violation
        console.error('Error creating user:', error);
      }
      return { username };
    } else {
      mockUsers.add(username);
      return { username };
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
      return Array.from(mockUsers).map(u => ({ username: u, is_online: true }));
    }
  },

  async addMessage({ sender_username, recipient_username, content, status = 'sent' }) {
    const newMessage = {
      id: Math.random().toString(36).substring(7),
      sender_username,
      recipient_username,
      content,
      status,
      created_at: new Date().toISOString()
    };
    
    if (supabase) {
      console.log('Attempting to insert message:', { sender_username, recipient_username, content, status });
      const { data, error } = await supabase
        .from('messages')
        .insert([{ 
          sender_username, 
          recipient_username, 
          content, 
          status 
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting message:', JSON.stringify(error, null, 2));
        throw error;
      }
      console.log('Message saved successfully:', data);
      return data;
    } else {
      mockMessages.push(newMessage);
      return newMessage;
    }
  },

  async getMessages(user1, user2) {
    if (supabase) {
      // Fetch messages where sender is user1 and recipient is user2, OR sender is user2 and recipient is user1
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
