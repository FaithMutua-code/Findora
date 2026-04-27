import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/utils/AuthContext';
import {API_URL } from '@/config';

export default function EditProfileScreen() {
  const router = useRouter();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Must be used inside AuthProvider');
  }

  const { authData } = context;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🚀 Fetch current user
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
      });

      setForm({
        name: res.data.name,
        email: res.data.email,
        phone_number: res.data.phone_number || '',
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 🚀 Validation
  const validate = () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }

    if (!form.email.includes('@')) {
      Alert.alert('Error', 'Enter a valid email');
      return false;
    }

    return true;
  };

  // 🚀 Update profile
  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      await axios.put(
        `${API_URL}/api/user`,
        form,
        {
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        }
      );

      Alert.alert('Success', 'Profile updated!');
      router.back(); // go back to settings
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Update failed'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(text) =>
          setForm({ ...form, name: text })
        }
      />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        keyboardType="email-address"
        onChangeText={(text) =>
          setForm({ ...form, email: text })
        }
      />

      {/* Phone */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={form.phone_number}
        keyboardType="phone-pad"
        onChangeText={(text) =>
          setForm({ ...form, phone_number: text })
        }
      />

      {/* Save Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },

  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  button: {
    height: 50,
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cancel: {
    textAlign: 'center',
    marginTop: 15,
    color: '#999',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});