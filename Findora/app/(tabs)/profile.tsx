import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/utils/AuthContext';
import { API_URL } from '@/config';
import { useTheme } from '@/utils/ThemeContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const context = useContext(AuthContext);
  if (!context) throw new Error('Must be used inside AuthProvider');
  const { authData } = context;

  const [form, setForm] = useState({ name: '', email: '', phone_number: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${authData?.token}` },
      });
      setForm({
        name: res.data.name,
        email: res.data.email,
        phone_number: res.data.phone_number || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const validate = () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return false; }
    if (!form.email.includes('@')) { Alert.alert('Error', 'Enter a valid email'); return false; }
    return true;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await axios.put(`${API_URL}/api/user`, form, {
        headers: { Authorization: `Bearer ${authData?.token}` },
      });
      Alert.alert('Success', 'Profile updated!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{form.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Update your account info</Text>
      </View>

      {/* Form Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

        <Text style={[styles.label, { color: colors.subtext }]}>Full Name</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Your name"
            placeholderTextColor={colors.placeholder}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
        </View>

        <Text style={[styles.label, { color: colors.subtext }]}>Email</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.placeholder}
            value={form.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
        </View>

        <Text style={[styles.label, { color: colors.subtext }]}>Phone Number</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="+254 7XX XXX XXX"
            placeholderTextColor={colors.placeholder}
            value={form.phone_number}
            keyboardType="phone-pad"
            onChangeText={(text) => setForm({ ...form, phone_number: text })}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Save Changes</Text>
        }
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.cancel, { color: colors.subtext }]}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatarLarge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#6C5CE7', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13 },
  card: {
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 0.5,
  },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6, marginTop: 4 },
  inputWrapper: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, marginBottom: 14,
  },
  input: { height: 48, fontSize: 15 },
  button: {
    height: 50, backgroundColor: '#6C5CE7',
    borderRadius: 12, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancel: { textAlign: 'center', fontSize: 14, marginBottom: 30 },
});