import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LocationPicker from '@/components/LocationPicker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {API_URL } from '@/config';

const CATEGORIES = [
  'Keys', 'Wallet', 'Phone', 'Bag',
  'Laptop', 'Earphones', 'Charger', 'Camera',
  'Clothing', 'Shoes', 'Watch', 'Jewelry',
  'ID / Passport', "Driver's License", 'Bank Card', 'Documents',
  'Pet', 'Toy', 'Books', 'Other',
];

export default function ShareItemScreen() {
  const router = useRouter();
  const context = useContext(AuthContext);
  if (!context) throw new Error('Must be inside AuthProvider');
  const { authData } = context;

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    type: 'lost',
    date_lost_found: new Date(),
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const descRef = useRef<TextInput | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setForm({ ...form, date_lost_found: selectedDate });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location) {
      Alert.alert('Error', 'Fill all required fields');
      return;
    }
    if (!form.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('location', form.location);
      data.append('type', form.type);

      // ✅ Fix: send actual date formatted as YYYY-MM-DD
      const dateStr = form.date_lost_found.toISOString().split('T')[0];
      data.append('date_lost_found', dateStr);

      // ✅ Fix: send coordinates if available
      if (form.latitude !== null) data.append('latitude', String(form.latitude));
      if (form.longitude !== null) data.append('longitude', String(form.longitude));

      if (image) {
        data.append('image', {
          uri: image,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }

    const response = await axios.post(`${API_URL}/api/items`, data, {
  headers: {
    Authorization: `Bearer ${authData?.token}`,
    'Content-Type': 'multipart/form-data',
  },
});

const newItem = response.data.item;

// 🔍 Check matches
const matchResponse = await axios.get(
  `${API_URL}/api/matches/${newItem.id}`,
  {
    headers: {
      Authorization: `Bearer ${authData?.token}`,
    },
  }
);

const matches = matchResponse.data;

Alert.alert('Success', 'Item posted successfully', [
  {
    text: 'OK',
    onPress: () => {
      setForm({
        title: '',
        description: '',
        category: '',
        location: '',
        type: 'lost',
        date_lost_found: new Date(),
        latitude: null,
        longitude: null,
      });
      setImage(null);

      if (matches.length > 0) {
       router.push({
  pathname: "/match/matchScreen",
  params: { id: newItem.id },
});
      } else {
        router.navigate('/(tabs)/feedScreen');
      }
    },
  },

      ]);
    } catch (error: any) {
      console.error('Submit error:', error.response?.data ?? error.message);
      Alert.alert('Error', error.response?.data?.message ?? 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.header}>Share Item</Text>
        <Text style={styles.sub}>Help others find lost items</Text>

        {/* IMAGE */}
        <TouchableOpacity style={styles.imageCard} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={30} color="#777" />
              <Text style={{ color: '#777', marginTop: 5 }}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* TYPE */}
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
            returnKeyType="next"
            onSubmitEditing={() => descRef.current?.focus()}
          />

          <TextInput
            ref={descRef}
            placeholder="Description *"
            style={[styles.input, styles.textArea]}
            multiline
            value={form.description}
            onChangeText={(t) => setForm({ ...form, description: t })}
          />

          {/* DATE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {form.type === 'lost' ? 'Date Lost *' : 'Date Found *'}
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.dateText}>
                {form.date_lost_found.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.date_lost_found}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* CATEGORY */}
          <Text style={styles.categoryLabel}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, form.category === cat && styles.chipActive]}
                onPress={() => setForm({ ...form, category: cat })}
              >
                <Text style={form.category === cat ? styles.chipTextActive : styles.chipText}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* LOCATION */}
          <LocationPicker
            value={form.location}
            onChange={({ address, latitude, longitude }) => {
              setForm({ ...form, location: address, latitude, longitude });
            }}
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Post Item</Text>
          }
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 28, fontWeight: '700', color: '#111' },
  sub: { color: '#666', marginBottom: 15 },
  imageCard: {
    height: 200, backgroundColor: '#fff', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  toggleRow: { flexDirection: 'row', marginBottom: 15 },
  toggle: {
    flex: 1, padding: 12, backgroundColor: '#fff',
    marginHorizontal: 5, borderRadius: 10, alignItems: 'center',
  },
  toggleActive: { backgroundColor: '#6C5CE7' },
  toggleText: { color: '#333', fontWeight: '600' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 20 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 10, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  dateButton: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center',
  },
  dateText: { fontSize: 16, color: '#333', marginLeft: 10 },
  categoryLabel: { fontSize: 13, color: '#888', marginBottom: 8, fontWeight: '500' },
  chipsScroll: { marginBottom: 4 },
  chipsContainer: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 20 },
  chipActive: { backgroundColor: '#6C5CE7' },
  chipText: { color: '#444', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontSize: 13, fontWeight: '600' },
  button: {
    backgroundColor: '#6C5CE7', padding: 15,
    marginBottom: 50, borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});