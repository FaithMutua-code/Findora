import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API = 'http://192.168.100.129:8000';

export default function ShareItemScreen() {
  const router = useRouter();
  const context = useContext(AuthContext);

  if (!context) throw new Error('Must be inside AuthProvider');

  const { authData } = context;

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    type: 'lost', // lost | found
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => setImage(null);

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location) {
      Alert.alert('Error', 'Fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category', form.category || 'General');
      data.append('location', form.location);
      data.append('type', form.type);

      if (image) {
        data.append('image', {
          uri: image,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await axios.post(`${API}/api/items`, data, {
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
      });

      Alert.alert('Success', 'Item posted successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
    <ScrollView style={styles.container}>

      <Text style={styles.header}>Share Item</Text>
      <Text style={styles.sub}>Help others find lost items</Text>

      {/* IMAGE CARD */}
      <TouchableOpacity style={styles.imageCard} onPress={pickImage}>
        {image ? (
          <>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.removeBtn} onPress={removeImage}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={30} color="#777" />
            <Text style={{ color: '#777', marginTop: 5 }}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* TYPE TOGGLE */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, form.type === 'lost' && styles.toggleActive]}
          onPress={() => setForm({ ...form, type: 'lost' })}
        >
          <Text style={form.type === 'lost' ? styles.toggleTextActive : styles.toggleText}>
            Lost
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggle, form.type === 'found' && styles.toggleActive]}
          onPress={() => setForm({ ...form, type: 'found' })}
        >
          <Text style={form.type === 'found' ? styles.toggleTextActive : styles.toggleText}>
            Found
          </Text>
        </TouchableOpacity>
      </View>

      {/* INPUTS */}
      <View style={styles.card}>
        <TextInput
          placeholder="Title *"
          style={styles.input}
          value={form.title}
          onChangeText={(t) => setForm({ ...form, title: t })}
        />

        <TextInput
          placeholder="Description *"
          style={[styles.input, styles.textArea]}
          multiline
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
        />

        <TextInput
          placeholder="Category"
          style={styles.input}
          value={form.category}
          onChangeText={(t) => setForm({ ...form, category: t })}
        />

        <TextInput
          placeholder="Location *"
          style={styles.input}
          value={form.location}
          onChangeText={(t) => setForm({ ...form, location: t })}
        />
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post Item</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    padding: 20,
  },

  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },

  sub: {
    color: '#666',
    marginBottom: 15,
  },

  imageCard: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    alignItems: 'center',
  },

  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 20,
  },

  toggleRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  toggle: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },

  toggleActive: {
    backgroundColor: '#6C5CE7',
  },

  toggleText: {
    color: '#333',
    fontWeight: '600',
  },

  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#6C5CE7',
    padding: 15,
    marginBottom: 50,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});