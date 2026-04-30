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
import { useTheme } from '@/utils/ThemeContext';

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
  const { colors } = useTheme();

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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background blobs */}
<View style={[styles.blob, { width: 230, height: 230, top: -65,    left: -45,  backgroundColor: colors.blob1, opacity: 0.7 }]} />
<View style={[styles.blob, { width: 170, height: 170, top: -35,    right: -50, backgroundColor: colors.blob2, opacity: 0.5 }]} />
<View style={[styles.blob, { width: 190, height: 190, bottom: -75, right: -50, backgroundColor: colors.blob3, opacity: 0.4 }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>Join Findora — Lost & Found Campus</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

            <Text style={[styles.label, { color: colors.subtext }]}>Email</Text>
            <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={15} color={colors.icon} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                value={formData.email}
                onChangeText={(t) => setFormData({ ...formData, email: t })}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <Text style={[styles.label, { color: colors.subtext }]}>Username</Text>
            <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={15} color={colors.icon} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="yourname"
                placeholderTextColor={colors.placeholder}
                value={formData.username}
                onChangeText={(t) => setFormData({ ...formData, username: t })}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <Text style={[styles.label, { color: colors.subtext }]}>
              Phone number{' '}
              <Text style={{ color: colors.placeholder, fontWeight: '400' }}>(optional)</Text>
            </Text>
            <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={15} color={colors.icon} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="+254 7XX XXX XXX"
                placeholderTextColor={colors.placeholder}
                value={formData.phone_number}
                onChangeText={(t) => setFormData({ ...formData, phone_number: t })}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <Text style={[styles.label, { color: colors.subtext }]}>Password</Text>
            <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={15} color={colors.icon} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.placeholder}
                value={formData.password}
                onChangeText={(t) => setFormData({ ...formData, password: t })}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={15} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.subtext }]}>Confirm password</Text>
            <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={15} color={colors.icon} style={styles.fieldIcon} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                placeholder="Repeat password"
                placeholderTextColor={colors.placeholder}
                value={formData.password_confirmation}
                onChangeText={(t) => setFormData({ ...formData, password_confirmation: t })}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={15} color={colors.icon} />
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
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.subtext }]}>or sign up with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google */}
            <TouchableOpacity style={[styles.googleBtn, { borderColor: colors.border }]}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={[styles.googleText, { color: colors.text }]}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: colors.subtext }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={loading}>
                <Text style={[styles.loginLink, { color: PURPLE }]}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  blob: { position: 'absolute', borderRadius: 999 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingBottom: 30 },
  header: { alignItems: 'center', paddingTop: 52, paddingBottom: 18 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 5 },
  subtitle: { fontSize: 13 },
  card: {
    borderRadius: 20, padding: 20,
    borderWidth: 0.5,
  },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 5, letterSpacing: 0.3 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, height: 44, marginBottom: 12,
  },
  fieldIcon: { marginRight: 8 },
  fieldInput: { flex: 1, fontSize: 14 },
  registerBtn: {
    height: 46, backgroundColor: PURPLE,
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', marginTop: 6, marginBottom: 16,
  },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dividerLine: { flex: 1, height: 0.5 },
  dividerText: { fontSize: 12 },
  googleBtn: {
    height: 46, borderWidth: 1,
    borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleText: { fontSize: 14, fontWeight: '500' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  loginText: { fontSize: 13 },
  loginLink: { fontSize: 13, fontWeight: '500' },
});