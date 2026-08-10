import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, KeyboardAvoidingView, Platform, Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import socket from '../services/socket';
import api from '../services/api';

const ChatScreen = ({ route, navigation }) => {
  const { currentUsername, recipientUsername } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isOnline, setIsOnline] = useState(false); // Can be linked to socket logic
  const flatListRef = useRef();

  useEffect(() => {
    loadHistory();
    setupSocket();

    return () => {
      // Don't completely disconnect socket if going back to conversations, 
      // just remove specific listeners if necessary. We'll leave it connected for now.
    };
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.get(`/api/messages?user1=${currentUsername}&user2=${recipientUsername}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  const setupSocket = () => {
    if (!socket.connected) {
      socket.connect();
      socket.emit('user_join', currentUsername);
    }

    socket.on('receive_message', (message) => {
      // Only add if it belongs to this conversation
      if (
        (message.sender_username === currentUsername && message.recipient_username === recipientUsername) ||
        (message.sender_username === recipientUsername && message.recipient_username === currentUsername)
      ) {
        setMessages((prev) => [...prev, message]);
        if (message.sender_username === recipientUsername) {
          socket.emit('message_read', { messageId: message.id, recipient_username: recipientUsername });
        }
      }
    });
    
    // We can also listen to user_status to set isOnline
    socket.on('user_status', ({ username, status }) => {
      if (username === recipientUsername) {
        setIsOnline(status === 'online');
      }
    });
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const messageData = {
      sender_username: currentUsername,
      recipient_username: recipientUsername,
      content: inputText.trim(),
    };

    socket.emit('send_message', messageData);
    setInputText('');
  };

  const renderItem = ({ item }) => {
    const isOwn = item.sender_username === currentUsername;
    return (
      <View style={[styles.messageWrapper, isOwn ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background shape */}
      <View style={styles.topBackground} />

      <SafeAreaView style={styles.safeArea}>
        {/* Custom Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{recipientUsername}</Text>
              <Text style={styles.headerStatus}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <View style={styles.headerAvatarContainer}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${recipientUsername}&background=random&color=fff&size=100` }} 
              style={styles.headerAvatar} 
            />
          </View>
        </View>

        {/* Chat List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Write a message"
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
            >
              <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF7FD', // Light blue background from reference
  },
  topBackground: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 350,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 250, // creates the asymmetrical wave
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  backButton: {
    marginBottom: 15,
  },
  headerInfo: {
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // matching the serif look from design
  },
  headerStatus: {
    fontSize: 16,
    color: '#56CCF2',
    fontWeight: '500',
    marginTop: 4,
  },
  headerAvatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 20,
    maxWidth: '75%',
  },
  messageWrapperLeft: {
    alignSelf: 'flex-start',
  },
  messageWrapperRight: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  ownBubble: {
    backgroundColor: '#56CCF2', // Cyan/blue
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  otherMessageText: {
    color: '#333',
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 20 : 15, // extra padding for bottom notch area
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingTop: 15,
    paddingBottom: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#56CCF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  }
});

export default ChatScreen;
