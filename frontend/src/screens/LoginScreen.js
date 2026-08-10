import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await api.post(endpoint, {
        username: username.trim(),
        password: password.trim(),
      });

      if (isRegister) {
        Alert.alert('Success', 'Account created! You are now logged in.');
      }

      navigation.replace('Conversations', { username: response.data.username });
    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topDecoration} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={50} color="#56CCF2" />
        </View>

        <Text style={styles.title}>RealChat</Text>
        <Text style={styles.subtitle}>
          {isRegister ? 'Create an account to get started' : 'Sign in to continue'}
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonLoading]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isRegister ? 'Create Account' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsRegister(!isRegister)}
        >
          <Text style={styles.switchText}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.switchTextBold}>{isRegister ? 'Sign In' : 'Register'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topDecoration: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: '#EAF7FD',
    borderRadius: 150,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  iconContainer: {
    alignSelf: 'center',
    backgroundColor: '#EAF7FD',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#56CCF2',
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
    shadowColor: '#56CCF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 15,
    color: '#999',
  },
  switchTextBold: {
    color: '#56CCF2',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
