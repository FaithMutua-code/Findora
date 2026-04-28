import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import { EXPO_CLIENT_ID, API_URL } from '@/config';

WebBrowser.maybeCompleteAuthSession();

const PURPLE = '#6C5CE7';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const context = useContext(AuthContext);
  if (!context) throw new Error('Must be inside AuthProvider');
  const { login } = context;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: EXPO_CLIENT_ID,
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      if (res.data.token) {
        login(res.data);
        router.replace('/(tabs)');
      } else {
        setMessage(res.data.message || 'Login failed');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const sendTokenToBackend = useCallback(async (accessToken?: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google/mobile`, {
        access_token: accessToken,
      });
      login(res.data);
      router.replace('/(tabs)');
    } catch {
      setMessage('Google login failed. Please try again.');
    }
  }, [login, router]);

  useEffect(() => {
    if (response?.type === 'success') {
      sendTokenToBackend(response.authentication?.accessToken);
    }
  }, [response, sendTokenToBackend]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background blobs */}
      <View style={[styles.blob, { width: 260, height: 260, top: -70, left: -50, backgroundColor: '#8b7ff0', opacity: 0.7 }]} />
      <View style={[styles.blob, { width: 200, height: 200, top: -40, right: -60, backgroundColor: '#A29BFE', opacity: 0.5 }]} />
      <View style={[styles.blob, { width: 220, height: 220, bottom: -80, right: -60,backgroundColor: '#261E63', opacity: 0.4 }]} />
      <View style={[styles.blob, { width: 220, height: 220, bottom: -130, left: -60,backgroundColor: '#261E63', opacity: 0.4 }]} />

      <View style={styles.content}>
        {/* Logo */}
  

        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Sign in to your Findora account</Text>

        {/* Card */}
        <View style={styles.card}>
          {!!message && (
            <Text style={styles.errorText}>{message}</Text>
          )}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={16} color="#a89fd0" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              placeholder="you@example.com"
              placeholderTextColor="#c4bce8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={16} color="#a89fd0" style={styles.fieldIcon} />
            <TextInput
              style={styles.fieldInput}
              placeholder="••••••••"
              placeholderTextColor="#c4bce8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color="#c4bce8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.signinBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.signinText}>Sign in</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C5CE7' },
  blob: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: '#6C5CE7'
  },
  content: {
    flex: 1, justifyContent: 'center',
    paddingHorizontal: 20, paddingTop: 20,
  },
  logoCircle: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: PURPLE,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 16,
  },
  title: {
    fontSize: 24, fontWeight: '600', color: '#1a1040',
    textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: 13, color: 'black',
    textAlign: 'center', marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 24, borderWidth: 0.5, borderColor: '#e4dff7',
  },
  errorText: {
    color: 'red', fontSize: 13,
    textAlign: 'center', marginBottom: 12,
  },
  label: {
    fontSize: 12, color: '#7c6fa0',
    fontWeight: '500', marginBottom: 6,
  },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e4dff7',
    borderRadius: 10, paddingHorizontal: 12,
    height: 48, backgroundColor: '#faf9ff', marginBottom: 14,
  },
  fieldIcon: { marginRight: 8 },
  fieldInput: { flex: 1, fontSize: 14, color: '#1a1040' },
  forgotRow: { alignItems: 'flex-end', marginTop: -6, marginBottom: 18 },
  forgotText: { fontSize: 12, color: PURPLE },
  signinBtn: {
    height: 48, backgroundColor: PURPLE,
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  signinText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  divider: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 14,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: '#e4dff7' },
  dividerText: { fontSize: 12, color: '#a89fd0' },
  googleBtn: {
    height: 48, borderWidth: 1, borderColor: '#e4dff7',
    borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 4,
  },
  googleText: { fontSize: 14, color: '#1a1040', fontWeight: '500' },
  registerRow: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 18,
  },
  registerText: { fontSize: 13, color: '#7c6fa0' },
  registerLink: { fontSize: 13, color: PURPLE, fontWeight: '500' },
});