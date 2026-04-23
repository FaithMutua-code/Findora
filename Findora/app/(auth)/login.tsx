import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { EXPO_CLIENT_ID } from '@/config';

WebBrowser.maybeCompleteAuthSession();

const getApiBaseUrl = () => {
  return 'http://192.168.100.129:8000';
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('LoginScreen must be used within AuthProvider');
  }
  
  const { login } = context; // Remove setAuthData if you have login method

  // Google Auth Setup - Use 'clientId' instead of 'expoClientId'
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID, // Use the imported env variable
    // For Android and iOS, you'd add these too:
    // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    // iosClientId: 'YOUR_IOS_CLIENT_ID',
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${getApiBaseUrl()}/api/login`, {
        email,
        password,
      });
      const resData = response.data;

      if (resData.token) {
        login(resData); // Use login instead of setAuthData
        router.replace("/(tabs)");
      } else {
        setMessage(resData.message || 'Login failed');
      }

      console.log(response.data);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage('Login failed. Please try again.');
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sendTokenToBackend = useCallback(async (accessToken: string | undefined) => {
    try {
      const res = await axios.post(
        'http://192.168.100.129:8000/api/auth/google/mobile',
        {
          access_token: accessToken,
        }
      );

      // Same flow as normal login
      login(res.data); // { token, user }
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
      setMessage('Google login failed. Please try again.');
    }
  }, [login, router]); // Add dependencies

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      sendTokenToBackend(authentication?.accessToken);
    }
  }, [response, sendTokenToBackend]); // Add sendTokenToBackend to dependencies

  const handleGoogleLogin = () => {
    promptAsync();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Lost & Found</Text>
        <Text style={styles.subtitle}>Campus App</Text>

        <View style={styles.form}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
            {message}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.googleBtn} 
            onPress={handleGoogleLogin}
            disabled={!request}
          >
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            disabled={loading}
          >
            <Text style={styles.link}>
              {"Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  googleBtn: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginTop: 10,
  },
  googleText: {
    fontWeight: '600',
    color: '#333',
  },
});