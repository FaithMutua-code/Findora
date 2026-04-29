// components/RecoveryModal.tsx
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@/config';
import { useTheme } from '@/utils/ThemeContext';

const PURPLE = '#6C5CE7';

type RecoveryMethod = 'system_match' | 'direct_contact' | 'admin_assisted';

interface Props {
  visible: boolean;
  itemId: number;
  itemTitle: string;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

const METHODS: { key: RecoveryMethod; label: string; icon: any; desc: string }[] = [
  {
    key: 'system_match',
    label: 'System Match',
    icon: 'git-compare-outline',
    desc: 'Item was found via Findora\'s smart matching',
  },
  {
    key: 'direct_contact',
    label: 'Direct Contact',
    icon: 'chatbubbles-outline',
    desc: 'Owner contacted finder directly through the app',
  },
  {
    key: 'admin_assisted',
    label: 'Admin Assisted',
    icon: 'shield-checkmark-outline',
    desc: 'Recovery was facilitated by an administrator',
  },
];

export default function RecoveryModal({ visible, itemId, itemTitle, token, onClose, onSuccess }: Props) {
  const { colors } = useTheme();
  const [method, setMethod] = useState<RecoveryMethod | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!method) {
      Alert.alert('Error', 'Please select a recovery method');
      return;
    }
    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/api/items/${itemId}/return`,
        { recovery_method: method, recovery_notes: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', '🎉 Item marked as recovered!');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark as recovered');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setMethod(null); setNotes(''); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>

          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="checkmark-done-circle" size={28} color={PURPLE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Mark as Recovered</Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
                {itemTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { onClose(); reset(); }}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {/* Recovery Method */}
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>How was it recovered?</Text>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.methodCard,
                { backgroundColor: colors.input, borderColor: colors.border },
                method === m.key && styles.methodCardActive,
              ]}
              onPress={() => setMethod(m.key)}
            >
              <View style={[styles.methodIconBox, { backgroundColor: method === m.key ? PURPLE : colors.card }]}>
                <Ionicons name={m.icon} size={20} color={method === m.key ? '#fff' : colors.icon} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, { color: colors.text },
                  method === m.key && { color: PURPLE }]}>
                  {m.label}
                </Text>
                <Text style={[styles.methodDesc, { color: colors.subtext }]}>{m.desc}</Text>
              </View>
              {method === m.key && (
                <Ionicons name="checkmark-circle" size={20} color={PURPLE} />
              )}
            </TouchableOpacity>
          ))}

          {/* Notes */}
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>
            Notes <Text style={{ color: colors.icon, fontWeight: '400' }}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.notesInput, {
              backgroundColor: colors.input,
              borderColor: colors.border,
              color: colors.text,
            }]}
            placeholder="Any details about the recovery..."
            placeholderTextColor={colors.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, !method && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!method || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-done" size={20} color="#fff" />
                  <Text style={styles.submitText}>Confirm Recovery</Text>
                </>
            }
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  headerIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f4f3ff', justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10, letterSpacing: 0.3 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10,
  },
  methodCardActive: { borderColor: PURPLE },
  methodIconBox: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  methodLabel: { fontSize: 14, fontWeight: '600' },
  methodDesc: { fontSize: 11, marginTop: 2 },
  notesInput: {
    borderWidth: 1, borderRadius: 12, padding: 12,
    fontSize: 14, minHeight: 80, marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: PURPLE, borderRadius: 14,
    height: 50, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});