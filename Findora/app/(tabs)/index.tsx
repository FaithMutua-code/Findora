import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/utils/AuthContext';
import { API_URL } from '@/config';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/utils/ThemeContext';

const PURPLE = '#6C5CE7';

type Item = {
  id: number; title: string; description: string; location: string;
  date_lost_found: string; type: 'lost' | 'found'; image?: string;
  category?: string; user?: { id: number; name: string }; user_id: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { authData } = useContext(AuthContext)!;
  const [user, setUser] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headers = { Authorization: `Bearer ${authData?.token}` };

  const fetchData = async () => {
    try {
      const [userRes, itemsRes] = await Promise.all([
        axios.get(`${API_URL}/api/user`, { headers }),
        axios.get(`${API_URL}/api/items?page=1`, { headers }),
      ]);
      setUser(userRes.data);
      const payload = itemsRes.data;
      const items: Item[] = Array.isArray(payload.items)
        ? payload.items
        : payload.items?.data ?? [];
      setRecentItems(items.slice(0, 6));
    } catch (e) {
      console.error('Home fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const lostCount = recentItems.filter(i => i.type === 'lost').length;
  const foundCount = recentItems.filter(i => i.type === 'found').length;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#2a1a1a' : '#fff0f0' }]}>
            <Ionicons name="alert-circle" size={22} color="#e74c3c" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{lostCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Lost</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#0f2a1a' : '#e6f9ee' }]}>
            <Ionicons name="checkmark-circle" size={22} color="#2ecc71" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{foundCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Found</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1535' : '#f4f3ff' }]}>
            <Ionicons name="people" size={22} color={PURPLE} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{recentItems.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Total</Text>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/(tabs)/shareItem')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? '#1a1535' : '#f4f3ff' }]}>
                <Ionicons name="add-circle" size={26} color={PURPLE} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Post Item</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/(tabs)/feedScreen')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? '#0f2a1a' : '#e6f9ee' }]}>
                <Ionicons name="search" size={26} color="#2ecc71" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Browse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? '#2a1a1a' : '#fff0f0' }]}>
                <Ionicons name="person" size={26} color="#e74c3c" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Items ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Items</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/feedScreen')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentItems.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Ionicons name="cube-outline" size={40} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No items yet</Text>
            </View>
          ) : (
            recentItems.map(item => {
              const isFound = item.type === 'found';
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.95}
                  onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })}
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.input }]}>
                      <Ionicons name="image-outline" size={28} color={colors.icon} />
                    </View>
                  )}

                  <View style={styles.itemContent}>
                    <View style={styles.itemTitleRow}>
                      <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={[styles.badge, isFound ? styles.badgeFound : styles.badgeLost]}>
                        <Text style={[styles.badgeText, { color: isFound ? '#2ecc71' : '#e74c3c' }]}>
                          {isFound ? 'FOUND' : 'LOST'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.itemMeta}>
                      <Ionicons name="location-outline" size={12} color={colors.icon} />
                      <Text style={[styles.itemMetaText, { color: colors.subtext }]} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                    <View style={styles.itemMeta}>
                      <MaterialIcons name="category" size={12} color={colors.icon} />
                      <Text style={[styles.itemMetaText, { color: colors.subtext }]}>{item.category}</Text>
                    </View>
                    <View style={styles.itemMeta}>
                      <Ionicons name="time-outline" size={12} color={colors.icon} />
                      <Text style={[styles.itemMetaText, { color: colors.subtext }]}>{item.date_lost_found}</Text>
                    </View>
                    <Text style={[styles.itemDesc, { color: colors.subtext }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20, backgroundColor: '#A29BFE',
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 2 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  statsRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 20,
    paddingVertical: 16, backgroundColor: '#A29BFE', paddingBottom: 28,
  },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 13, color: PURPLE, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  actionCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 8,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '600' },
  itemCard: {
    flexDirection: 'row', borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  itemImage: { width: 90, height: 90 },
  itemImagePlaceholder: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  itemContent: { flex: 1, padding: 10, justifyContent: 'center' },
  itemTitleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4,
  },
  itemTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeFound: { backgroundColor: '#e6f9ee' },
  badgeLost: { backgroundColor: '#fff0f0' },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  itemMetaText: { fontSize: 11, flex: 1 },
  itemDesc: { fontSize: 12, lineHeight: 20, marginTop: 3 },
  emptyCard: { borderRadius: 14, padding: 30, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '500' },
});