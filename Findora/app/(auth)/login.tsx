import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const API_URL = 'https://skincare-gallstone-brick.ngrok-free.dev/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const context = useContext(AuthContext);

  if (!context) throw new Error('Must be used within AuthProvider');
  const { login } = context;

  // Normal login
  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (res.data.token) {
        login(res.data);
        router.replace('/(tabs)');
      } else {
        setMessage(res.data.message || 'Login failed');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google login via Laravel Socialite
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setMessage('');

      // 1. Get Google OAuth URL from Laravel
      const res = await fetch(`${API_URL}/auth/google`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });
      const { url } = await res.json();

      // 2. Open browser
      const result = await WebBrowser.openAuthSessionAsync(
        url,
        Linking.createURL('/auth/callback')
      );

      console.log('Browser result:', result);

      if (result.type !== 'success') {
        setMessage('Google login cancelled.');
        return;
      }

      // 3. Extract token from deep link
      const params = new URL(result.url).searchParams;
      const token = params.get('token');
      const userRaw = params.get('user');

      if (!token) {
        setMessage('Google login failed. No token received.');
        return;
      }

      const user = JSON.parse(decodeURIComponent(userRaw ?? '{}'));
      login({ token, user });
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error('Google login error:', error);
      setMessage('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {message ? (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
              {message}
            </Text>
          ) : null}

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
            style={[styles.googleBtn, loading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} disabled={loading}>
            <Text style={styles.link}>{"Don't have an account? Register"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#666', marginBottom: 40 },
  form: {
    backgroundColor: '#fff', padding: 20, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  input: {
    height: 50, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16,
  },
  button: {
    height: 50, backgroundColor: '#007AFF', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 15, fontSize: 16 },
  googleBtn: {
    backgroundColor: '#fff', padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginTop: 10,
  },
  googleText: { fontWeight: '600', color: '#333' },
});