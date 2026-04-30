import React, { useState, useContext, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import LocationPicker from '@/components/LocationPicker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '@/config';
import { useTheme } from '@/utils/ThemeContext';

const CATEGORIES = [
  'Keys', 'Wallet', 'Phone', 'Bag', 'Laptop', 'Earphones', 'Charger', 'Camera',
  'Clothing', 'Shoes', 'Watch', 'Jewelry', 'ID / Passport', "Driver's License",
  'Bank Card', 'Documents', 'Pet', 'Toy', 'Books', 'Other',
];

export default function ShareItemScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const context = useContext(AuthContext);
  if (!context) throw new Error('Must be inside AuthProvider');
  const { authData } = context;

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    manualLocation: '',
    type: 'lost', date_lost_found: new Date(),
    latitude: null as number | null, longitude: null as number | null,
  });

  const descRef = useRef<TextInput | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setForm({ ...form, date_lost_found: selectedDate });
  };

  const handleSubmit = async () => {
    const finalLocation = useManualLocation ? form.manualLocation : form.location;

    if (!form.title || !form.description || !finalLocation) {
      Alert.alert('Error', 'Fill all required fields'); return;
    }
    if (!form.category) {
      Alert.alert('Error', 'Please select a category'); return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('location', finalLocation);
      data.append('type', form.type);
      data.append('date_lost_found', form.date_lost_found.toISOString().split('T')[0]);
      if (!useManualLocation && form.latitude !== null) data.append('latitude', String(form.latitude));
      if (!useManualLocation && form.longitude !== null) data.append('longitude', String(form.longitude));
      if (image) data.append('image', { uri: image, name: 'photo.jpg', type: 'image/jpeg' } as any);

      const response = await axios.post(`${API_URL}/api/items`, data, {
        headers: { Authorization: `Bearer ${authData?.token}`, 'Content-Type': 'multipart/form-data' },
      });
      const newItem = response.data.item;

      const matchResponse = await axios.get(`${API_URL}/api/matches/${newItem.id}`, {
        headers: { Authorization: `Bearer ${authData?.token}` },
      });

      Alert.alert('Success', 'Item posted successfully', [{
        text: 'OK',
        onPress: () => {
          setForm({
            title: '', description: '', category: '', location: '',
            manualLocation: '', type: 'lost', date_lost_found: new Date(),
            latitude: null, longitude: null,
          });
          setImage(null);
          setUseManualLocation(false);
          if (matchResponse.data.length > 0) {
            router.push({ pathname: '/match/matchScreen', params: { id: newItem.id } });
          } else {
            router.navigate('/(tabs)/feedScreen');
          }
        },
      }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message ?? 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.header, { color: colors.text }]}>Share Item</Text>
          <Text style={[styles.sub, { color: colors.subtext }]}>Help others find lost items</Text>

          {/* IMAGE */}
          <TouchableOpacity style={[styles.imageCard, { backgroundColor: colors.card }]} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={30} color={colors.icon} />
                <Text style={{ color: colors.icon, marginTop: 5 }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* TYPE */}
          <View style={styles.toggleRow}>
            {(['lost', 'found'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.toggle, { backgroundColor: colors.card },
                  form.type === t && styles.toggleActive]}
                onPress={() => setForm({ ...form, type: t })}
              >
                <Text style={form.type === t
                  ? styles.toggleTextActive
                  : [styles.toggleText, { color: colors.text }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* INPUTS */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TextInput
              placeholder="Title *"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
              returnKeyType="next"
              onSubmitEditing={() => descRef.current?.focus()}
            />

            <TextInput
              ref={descRef}
              placeholder="Description *"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, styles.textArea, { backgroundColor: colors.input, color: colors.text }]}
              multiline
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
            />

            {/* DATE */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {form.type === 'lost' ? 'Date Lost *' : 'Date Found *'}
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.icon} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {form.date_lost_found.toLocaleDateString(undefined, {
                    day: 'numeric', month: 'long', year: 'numeric',
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
            <Text style={[styles.categoryLabel, { color: colors.subtext }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, { backgroundColor: colors.input },
                    form.category === cat && styles.chipActive]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text style={form.category === cat
                    ? styles.chipTextActive
                    : [styles.chipText, { color: colors.subtext }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* LOCATION */}
            <Text style={[styles.categoryLabel, { color: colors.subtext, marginTop: 8 }]}>Location *</Text>

            {!useManualLocation ? (
              <>
                <LocationPicker
                  value={form.location}
                  onChange={({ address, latitude, longitude }) => {
                    setForm({ ...form, location: address, latitude, longitude });
                  }}
                />
                <TouchableOpacity
                  style={styles.locationToggleBtn}
                  onPress={() => {
                    setUseManualLocation(true);
                    setForm({ ...form, location: '', latitude: null, longitude: null });
                  }}
                >
                  <Ionicons name="pencil-outline" size={13} color="#6C5CE7" />
                  <Text style={styles.locationToggleText}>{"Can't find it on map? Enter manually"}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[styles.manualField, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <Ionicons name="location-outline" size={16} color={colors.icon} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.manualInput, { color: colors.text }]}
                    placeholder="e.g. Near the library, Block C, Gate 2..."
                    placeholderTextColor={colors.placeholder}
                    value={form.manualLocation}
                    onChangeText={(t) => setForm({ ...form, manualLocation: t })}
                  />
                </View>
                <TouchableOpacity
                  style={styles.locationToggleBtn}
                  onPress={() => {
                    setUseManualLocation(false);
                    setForm({ ...form, manualLocation: '' });
                  }}
                >
                  <Ionicons name="map-outline" size={13} color="#6C5CE7" />
                  <Text style={styles.locationToggleText}>Use map instead</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* SUBMIT */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
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
  header: { fontSize: 28, fontWeight: '700' },
  sub: { marginBottom: 15 },
  imageCard: {
    height: 200, borderRadius: 16, justifyContent: 'center',
    alignItems: 'center', marginBottom: 15, overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  toggleRow: { flexDirection: 'row', marginBottom: 15 },
  toggle: { flex: 1, padding: 12, marginHorizontal: 5, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: '#6C5CE7' },
  toggleText: { fontWeight: '600' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  card: { padding: 15, borderRadius: 16, marginBottom: 20 },
  input: { padding: 12, borderRadius: 10, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  dateButton: {
    borderWidth: 1, borderRadius: 8, padding: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  dateText: { fontSize: 16, marginLeft: 10 },
  categoryLabel: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  chipsScroll: { marginBottom: 4 },
  chipsContainer: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipActive: { backgroundColor: '#6C5CE7' },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontSize: 13, fontWeight: '600' },
  manualField: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, height: 48, marginBottom: 6,
  },
  manualInput: { flex: 1, fontSize: 14 },
  locationToggleBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, marginTop: 4, marginBottom: 4,
  },
  locationToggleText: { fontSize: 12, color: '#6C5CE7', fontWeight: '500' },
  button: { backgroundColor: '#6C5CE7', padding: 15, marginBottom: 50, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});