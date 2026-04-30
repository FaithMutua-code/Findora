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
import { useTheme } from '@/utils/ThemeContext';

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
  const { colors } = useTheme();

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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background blobs */}
<View style={[styles.blob, { width: 260, height: 260, top: -70,    left: -50,  backgroundColor: colors.blob1, opacity: 0.7 }]} />
<View style={[styles.blob, { width: 200, height: 200, top: -40,    right: -60, backgroundColor: colors.blob2, opacity: 0.5 }]} />
<View style={[styles.blob, { width: 220, height: 220, bottom: -80, right: -60, backgroundColor: colors.blob3, opacity: 0.4 }]} />
<View style={[styles.blob, { width: 220, height: 220, bottom:-130, left: -60,  backgroundColor: colors.blob3, opacity: 0.4 }]} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome back!</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Sign in to your Findora account</Text>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!!message && (
            <Text style={styles.errorText}>{message}</Text>
          )}

          {/* Email */}
          <Text style={[styles.label, { color: colors.subtext }]}>Email</Text>
          <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={16} color={colors.icon} style={styles.fieldIcon} />
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { color: colors.subtext }]}>Password</Text>
          <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.icon} style={styles.fieldIcon} />
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              placeholder="••••••••"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => router.push('/(auth)/forgotPassword')}
          >
            <Text style={[styles.forgotText, { color: PURPLE }]}>Forgot password?</Text>
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
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.subtext }]}>or continue with</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleBtn, { borderColor: colors.border }]}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={[styles.googleText, { color: colors.text }]}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: colors.subtext }]}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: PURPLE }]}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  blob: { position: 'absolute', borderRadius: 999 },
  content: {
    flex: 1, justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24, fontWeight: '600',
    textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center', marginBottom: 24,
  },
  card: {
    borderRadius: 20, padding: 24,
    borderWidth: 0.5,
  },
  errorText: {
    color: 'red', fontSize: 13,
    textAlign: 'center', marginBottom: 12,
  },
  label: {
    fontSize: 11, fontWeight: '600',
    marginBottom: 6, letterSpacing: 0.3,
  },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, height: 48, marginBottom: 14,
  },
  fieldIcon: { marginRight: 8 },
  fieldInput: { flex: 1, fontSize: 14 },
  forgotRow: { alignItems: 'flex-end', marginTop: -6, marginBottom: 18 },
  forgotText: { fontSize: 12 },
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
  dividerLine: { flex: 1, height: 0.5 },
  dividerText: { fontSize: 12 },
  googleBtn: {
    height: 48, borderWidth: 1,
    borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 4,
  },
  googleText: { fontSize: 14, fontWeight: '500' },
  registerRow: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 18,
  },
  registerText: { fontSize: 13 },
  registerLink: { fontSize: 13, fontWeight: '500' },
});