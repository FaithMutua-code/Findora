import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useContext } from 'react';
import {
  View, Text, ActivityIndicator, Image, StyleSheet,
  ScrollView, TouchableOpacity, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { API_URL } from '@/config';
import { AuthContext } from '@/utils/AuthContext';
import { useTheme } from '@/utils/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RecoveryModal from '@/components/RecoveryModal';

type User = { id: number; name: string };
type Item = {
  id: number; title: string; description: string; category: string;
  location: string; date_lost_found: string; type: 'lost' | 'found';
  image?: string; user?: User; user_id: number; created_at?: string;
  status: 'active' | 'returned';
  recovery_method?: string; recovery_notes?: string; recovered_at?: string;
};

export default function ItemScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { authData } = useContext(AuthContext)!;
  const { colors, isDark } = useTheme();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  const fetchItem = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/items/${id}`, {
      headers: { Authorization: `Bearer ${authData?.token}` },
    })
      .then(res => {
        // handle both { item: {...} } and direct object responses
        setItem(res.data.item ?? res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItem(); }, [id]);

  const handleShare = async () => {
    if (!item) return;
    const deepLink = Linking.createURL(`items/${item.id}`);
    await Share.share({
      message: `Check out ${item.title} on Findora!\n${deepLink}`,
      title: item.title,
    });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>Loading item...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={[styles.errorText]}>Item not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = Number(authData?.user?.id) === item.user_id;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Nav */}
      <View style={[styles.navbar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>{item.title} Detail</Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>

          {/* User Info Header */}
          <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.text }]}>
                {item.user?.name || 'Anonymous'}
              </Text>
              <Text style={[styles.typeLabel, { color: colors.subtext }]}>
                {item.type === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}
              </Text>
            </View>
            {item.status === 'returned' && (
              <View style={styles.returnedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#2ecc71" />
                <Text style={styles.returnedText}>Recovered</Text>
              </View>
            )}
          </View>

          {/* Image */}
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: colors.subtext }]}>{item.description}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.icon} />
              <Text style={[styles.metaText, { color: colors.icon }]}>{item.location}</Text>
            </View>

            {item.category && (
              <View style={styles.metaRow}>
                <MaterialIcons name="category" size={14} color="#6C5CE7" />
                <Text style={[styles.metaText, { color: '#6C5CE7' }]}>{item.category}</Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: colors.icon }]}>
                🕐 {item.type === 'lost' ? 'Lost on' : 'Found on'}: {item.date_lost_found}
              </Text>
            </View>

            {item.created_at && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={colors.icon} />
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Posted: {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Recovery Info (if returned) */}
          {item.status === 'returned' && item.recovery_method && (
            <View style={[styles.recoveryInfo, { backgroundColor: colors.input, borderColor: '#2ecc71' }]}>
              <View style={styles.recoveryHeader}>
                <Ionicons name="checkmark-done-circle" size={18} color="#2ecc71" />
                <Text style={styles.recoveryTitle}>Recovery Details</Text>
              </View>
              <Text style={[styles.recoveryMethod, { color: colors.subtext }]}>
                Method: {item.recovery_method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </Text>
              {item.recovery_notes ? (
                <Text style={[styles.recoveryNotes, { color: colors.subtext }]}>
                  Notes: {item.recovery_notes}
                </Text>
              ) : null}
              {item.recovered_at && (
                <Text style={[styles.recoveryNotes, { color: colors.icon }]}>
                  Recovered on: {new Date(item.recovered_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({
                pathname: '/chat/[userId]',
                params: { userId: item.user_id, userName: item.user?.name ?? 'User' },
              })}
            >
              <Ionicons name="chatbubble-outline" size={22} color={colors.icon} />
              <Text style={[styles.actionText, { color: colors.subtext }]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={colors.icon} />
              <Text style={[styles.actionText, { color: colors.subtext }]}>Share</Text>
            </TouchableOpacity>

            {isOwner && item.status !== 'returned' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setRecovering(true)}
              >
                <Ionicons name="checkmark-done-circle-outline" size={22} color="#2ecc71" />
                <Text style={[styles.actionText, { color: colors.subtext }]}>Recovered</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {recovering && (
        <RecoveryModal
          visible={recovering}
          itemId={item.id}
          itemTitle={item.title}
          token={authData?.token || ''}
          onClose={() => setRecovering(false)}
          onSuccess={() => {
            setRecovering(false);
            fetchItem();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { marginTop: 12, fontSize: 16, color: '#ff6b6b', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#6C5CE7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600' },

  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  navBtn: { padding: 6 },
  navTitle: { fontSize: 17, fontWeight: '700' },

  scrollContent: { padding: 12, paddingBottom: 32 },

  card: {
    borderRadius: 12, overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2,
  },

  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6C5CE7', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  userInfo: { flex: 1 },
  username: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  typeLabel: { fontSize: 12 },

  returnedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e6f9ee', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10,
  },
  returnedText: { fontSize: 11, color: '#2ecc71', fontWeight: '600' },

  image: { width: '100%', height: 280, backgroundColor: '#f0f0f0' },

  content: { padding: 14 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  metaText: { fontSize: 13 },

  recoveryInfo: {
    margin: 12, marginTop: 0, padding: 12,
    borderRadius: 10, borderWidth: 1,
  },
  recoveryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  recoveryTitle: { fontSize: 14, fontWeight: '700', color: '#2ecc71' },
  recoveryMethod: { fontSize: 13, marginBottom: 4 },
  recoveryNotes: { fontSize: 13, marginTop: 2 },

  actions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopWidth: 1,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 6 },
  actionText: { fontSize: 13 },
});