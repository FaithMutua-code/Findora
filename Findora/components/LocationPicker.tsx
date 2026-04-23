import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TextInput,
 
} from 'react-native';
import MapView, { Marker,  LongPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
interface LocationResult {
  address: string;
  latitude: number;
  longitude: number;
}
import { StatusBar } from "expo-status-bar";

interface Props {
  value: string;
  onChange: (result: LocationResult) => void;
}

const PURPLE = '#6C5CE7';

export default function LocationPicker({ value, onChange }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<Region>({
    latitude: -1.2921,
    longitude: 36.8219,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState(value);
  const [pendingResult, setPendingResult] = useState<LocationResult | null>(null);
  const mapRef = useRef<MapView>(null);

  // Reverse geocode coordinates → address string
  const reverseGeocode = async (lat: number, lng: number) => {
    setResolving(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results.length > 0) {
        const r = results[0];
        // Build human-readable address: "Shop Name, Street, City, Region"
        const parts = [
          r.name,
          r.street,
          r.district,
          r.city,
          r.region,
        ].filter(p => p && p.trim() !== '');

        // Remove duplicates (sometimes name === street)
        const unique = [...new Set(parts)];
        const formatted = unique.join(', ');

        setAddress(formatted);
        setSearch(formatted);
        setPendingResult({ address: formatted, latitude: lat, longitude: lng });
      }
    } catch (e) {
      console.warn('Geocode error:', e);
    } finally {
      setResolving(false);
    }
  };

  // Forward geocode search string → coordinates
  const searchLocation = async () => {
    if (!search.trim()) return;
    setResolving(true);
    try {
      const results = await Location.geocodeAsync(search);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const newRegion = { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
        setRegion(newRegion);
        setMarker({ latitude, longitude });
        mapRef.current?.animateToRegion(newRegion, 600);
        await reverseGeocode(latitude, longitude);
      } else {
        alert('Location not found. Try a different search.');
      }
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setResolving(false);
    }
  };

  // Use device GPS
  const getCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const newRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(newRegion);
      setMarker({ latitude, longitude });
      mapRef.current?.animateToRegion(newRegion, 600);
      await reverseGeocode(latitude, longitude);
    } catch (e) {
      console.warn('Location error:', e);
    } finally {
      setLocating(false);
    }
  };

  // Tap on map
  const handleMapPress = async (e: LongPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  // Confirm selection
  const handleSetLocation = () => {
    if (pendingResult) {
      onChange(pendingResult);
    }
    setModalVisible(false);
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="#6C5CE7" />
      {/* Trigger field */}
      <TouchableOpacity
        style={styles.inputRow}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
      >
        <Ionicons name="location-outline" size={18} color={PURPLE} style={{ marginRight: 8 }} />
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value || 'Location *'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </TouchableOpacity>

      {/* Full-screen modal */}
      <Modal visible={modalVisible} animationType="slide" statusBarTranslucent>
        <SafeAreaView style={styles.modal}>
  
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Your Location</Text>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={searchLocation}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={searchLocation} style={styles.searchBtn}>
              {resolving
                ? <ActivityIndicator size="small" color="#aaa" />
                : <Ionicons name="search" size={18} color="#aaa" />
              }
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <View style={styles.hint}>
            <Ionicons name="hand-left-outline" size={13} color="#999" />
            <Text style={styles.hintText}>Long press on the map to drop a pin</Text>
          </View>
          <View style={styles.mapContainer} pointerEvents="box-none">
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              region={region}
              onRegionChangeComplete={setRegion}
              onLongPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton={false}
              zoomEnabled
              scrollEnabled
              pitchEnabled={false}
              rotateEnabled={false}
            >
              {marker && (
                <Marker
                  coordinate={marker}
                  pinColor={PURPLE}
                  tappable={false}
                />
              )}
            </MapView>

            {/* GPS button */}
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={getCurrentLocation}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {locating
                ? <ActivityIndicator size="small" color={PURPLE} />
                : <Ionicons name="navigate" size={20} color={PURPLE} />
              }
            </TouchableOpacity>
          </View>

          {/* Selected address preview */}
          {address ? (
            <View style={styles.addressPreview}>
              <Ionicons name="location" size={16} color={PURPLE} />
              <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
            </View>
          ) : null}

          {/* Set Location button */}
          <TouchableOpacity
            style={[styles.setBtn, !pendingResult && styles.setBtnDisabled]}
            onPress={handleSetLocation}
            disabled={!pendingResult}
          >
            <Text style={styles.setBtnText}>Set Location</Text>
          </TouchableOpacity>

        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Trigger
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginTop: 12,
    backgroundColor: '#fff',
  },
  inputText: { flex: 1, fontSize: 14, color: '#333' },
  placeholder: { color: '#aaa' },

  // Modal
  modal: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#222' },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#333',
  },
  searchBtn: { padding: 4 },

  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#fafafa',
  },
  hintText: { fontSize: 12, color: '#999' },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: { ...StyleSheet.absoluteFillObject },
  gpsBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  // Address preview
  addressPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addressText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 18 },

  // Set Location button
  setBtn: {
    margin: 16,
    marginTop: 8,
    backgroundColor: PURPLE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  setBtnDisabled: { backgroundColor: '#ccc' },
  setBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});