import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import axios from 'axios';
import { API_URL } from '@/config';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#6C5CE7';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '', username: '', phone_number: '',
    password: '', password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const context = useContext(AuthContext);
  if (!context) throw new Error('Must be inside AuthProvider');
  const { setAuthData } = context;

  const validateForm = () => {
    if (!formData.email.trim()) { Alert.alert('Error', 'Email is required'); return false; }
    if (!formData.email.includes('@')) { Alert.alert('Error', 'Please enter a valid email'); return false; }
    if (!formData.username.trim()) { Alert.alert('Error', 'Username is required'); return false; }
    if (formData.username.length < 3) { Alert.alert('Error', 'Username must be at least 3 characters'); return false; }
    if (!formData.password) { Alert.alert('Error', 'Password is required'); return false; }
    if (formData.password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return false; }
    if (formData.password !== formData.password_confirmation) { Alert.alert('Error', 'Passwords do not match'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        name: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      }, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });

      const resData = response.data;
      if (resData.token) {
        setAuthData(resData);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Registration Failed', resData.message || 'Registration failed');
      }
    } catch (error: any) {
      let errorMessage = 'Could not register. Please try again.';
      if (error.response) {
        errorMessage = error.response.data?.message ||
          (error.response.data?.errors
            ? Object.values(error.response.data.errors).flat().join('\n')
            : `Server error: ${error.response.status}`);
      } else if (error.request) {
        errorMessage = 'No response from server. Check your connection.';
      } else {
        errorMessage = error.message || 'Registration failed';
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Background blobs */}
      <View style={[styles.blob, { width: 230, height: 230, top: -65, left: -45 , backgroundColor: '#8b7ff0', opacity: 0.7 }]} />
      <View style={[styles.blob, { width: 170, height: 170, top: -35, right: -50, opacity: 0.5,backgroundColor: '#A29BFE' }]} />
      <View style={[styles.blob, { width: 190, height: 190, bottom: -75, right: -50,backgroundColor: '#261E63', opacity: 0.4 }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
          
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join Findora — Lost & Found Campus</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>

            <Text style={styles.label}>Email</Text>
            <View style={styles.field}>
              <Ionicons name="mail-outline" size={15} color="#a89fd0" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="you@example.com"
                placeholderTextColor="#c4bce8"
                value={formData.email}
                onChangeText={(t) => setFormData({ ...formData, email: t })}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <Text style={styles.label}>Username</Text>
            <View style={styles.field}>
              <Ionicons name="person-outline" size={15} color="#a89fd0" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="yourname"
                placeholderTextColor="#c4bce8"
                value={formData.username}
                onChangeText={(t) => setFormData({ ...formData, username: t })}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <Text style={styles.label}>Phone number <Text style={{ color: '#c4bce8', fontWeight: '400' }}>(optional)</Text></Text>
            <View style={styles.field}>
              <Ionicons name="call-outline" size={15} color="#a89fd0" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="+254 7XX XXX XXX"
                placeholderTextColor="#c4bce8"
                value={formData.phone_number}
                onChangeText={(t) => setFormData({ ...formData, phone_number: t })}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={15} color="#a89fd0" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Min. 8 characters"
                placeholderTextColor="#c4bce8"
                value={formData.password}
                onChangeText={(t) => setFormData({ ...formData, password: t })}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={15} color="#c4bce8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={15} color="#a89fd0" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Repeat password"
                placeholderTextColor="#c4bce8"
                value={formData.password_confirmation}
                onChangeText={(t) => setFormData({ ...formData, password_confirmation: t })}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={15} color="#c4bce8" />
              </TouchableOpacity>
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.registerBtnText}>Create account</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.googleBtn}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={loading}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C5CE7' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: PURPLE, opacity: 0.15 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 30 },
  header: { alignItems: 'center', paddingTop: 52, paddingBottom: 18 },
  logoCircle: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: PURPLE, alignItems: 'center',
    justifyContent: 'center', marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '600', color: '#1a1040', marginBottom: 5 },
  subtitle: { fontSize: 13, color: '#7c6fa0' },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 20, borderWidth: 0.5, borderColor: '#e4dff7',
  },
  label: { fontSize: 11, color: '#7c6fa0', fontWeight: '500', marginBottom: 5, letterSpacing: 0.3 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e4dff7',
    borderRadius: 10, paddingHorizontal: 12,
    height: 44, backgroundColor: '#faf9ff', marginBottom: 12,
  },
  fieldIcon: { marginRight: 8 },
  fieldInput: { flex: 1, fontSize: 14, color: '#1a1040' },
  registerBtn: {
    height: 46, backgroundColor: PURPLE,
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', marginTop: 6, marginBottom: 16,
  },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: '#e4dff7' },
  dividerText: { fontSize: 12, color: '#a89fd0' },
  googleBtn: {
    height: 46, borderWidth: 1, borderColor: '#e4dff7',
    borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleText: { fontSize: 14, color: '#1a1040', fontWeight: '500' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  loginText: { fontSize: 13, color: '#7c6fa0' },
  loginLink: { fontSize: 13, color: PURPLE, fontWeight: '500' },
});