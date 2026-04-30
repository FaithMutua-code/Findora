import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '@/config';
import { AuthContext } from '@/utils/AuthContext';
import { useTheme } from '@/utils/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const PURPLE = '#6C5CE7';

type User = { id: number; name: string };

type Item = {
  id: number;
  title: string;
  description: string;
  location: string;
  category?: string;
  date_lost_found?: string;
  type: 'lost' | 'found';
  image?: string;
  user?: User;
  user_id: number;
  status?: 'active' | 'returned';
};

type Match = {
  item: Item;
  score: number;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#2ecc71';
  if (score >= 50) return '#FFB300';
  return '#ff4d4d';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Strong Match';
  if (score >= 50) return 'Possible Match';
  return 'Weak Match';
};

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const context = useContext(AuthContext);
  const { authData } = context!;
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMatch = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/matches/${id}`, {
        headers: {
          Authorization: `Bearer ${authData?.token}`,
          'Content-Type': 'application/json',
        },
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>Finding matches...</Text>
      </SafeAreaView>
    );
  }

  const renderMatch = ({ item: match }: { item: Match }) => {
    const { item } = match;
    const scoreColor = getScoreColor(match.score);
    const scoreLabel = getScoreLabel(match.score);
    const isFound = item.type === 'found';

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>

          {/* Score Banner */}
          <View style={[styles.scoreBanner, { backgroundColor: scoreColor + '18' }]}>
            <View style={styles.scoreBannerLeft}>
              <View style={[styles.scoreDot, { backgroundColor: scoreColor }]} />
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
            </View>
            <View style={[styles.scoreChip, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreChipText}>{match.score}% match</Text>
            </View>
          </View>

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
                {isFound ? '🟢 Found Item' : '🔴 Lost Item'}
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
            <Text style={[styles.description, { color: colors.subtext }]} numberOfLines={3}>
              {item.description}
            </Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.icon} />
              <Text style={[styles.metaText, { color: colors.icon }]}>{item.location}</Text>
            </View>

            {item.category && (
              <View style={styles.metaRow}>
                <MaterialIcons name="category" size={14} color={PURPLE} />
                <Text style={[styles.metaText, { color: PURPLE }]}>{item.category}</Text>
              </View>
            )}

            {item.date_lost_found && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={colors.icon} />
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  {isFound ? 'Found on' : 'Lost on'}: {item.date_lost_found}
                </Text>
              </View>
            )}
          </View>

          {/* Score Bar */}
          <View style={styles.barSection}>
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.barFill, {
                width: `${match.score}%` as any,
                backgroundColor: scoreColor,
              }]} />
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({
                pathname: '/chat/[userId]',
                params: { userId: item.user_id, userName: item.user?.name ?? 'User' },
              })}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.icon} />
              <Text style={[styles.actionText, { color: colors.subtext }]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })}
            >
              <Ionicons name="eye-outline" size={20} color={PURPLE} />
              <Text style={[styles.actionText, { color: PURPLE }]}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.navbar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.navTitle, { color: colors.text }]}>Possible Matches</Text>
          <Text style={[styles.navSubtitle, { color: colors.subtext }]}>
            {matches.length} result{matches.length !== 1 ? 's' : ''} found
          </Text>
        </View>
        <Ionicons name="search" size={22} color={PURPLE} />
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.card }]}>
            <Ionicons name="sad-outline" size={40} color={colors.icon} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No matches found</Text>
          <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
           {" We'll notify you when something comes up"}
          </Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => router.navigate('/(tabs)/feedScreen')}
          >
            <Text style={styles.backHomeBtnText}>Back to Feed</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderMatch}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, marginTop: 8 },

  navbar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  navBtn: { padding: 6 },
  navTitle: { fontSize: 17, fontWeight: '700' },
  navSubtitle: { fontSize: 12, marginTop: 2 },

  listContent: { padding: 12, paddingBottom: 40 },

  card: {
    borderRadius: 12, marginBottom: 16, overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2,
  },

  // Score banner
  scoreBanner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  scoreBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  scoreLabel: { fontSize: 12, fontWeight: '600' },
  scoreChip: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20,
  },
  scoreChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Card header
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: PURPLE, justifyContent: 'center',
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

  image: { width: '100%', height: 220, backgroundColor: '#f0f0f0' },

  content: { padding: 14 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  metaText: { fontSize: 13 },

  barSection: { paddingHorizontal: 14, paddingBottom: 12 },
  barTrack: { height: 4, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 4 },

  actions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopWidth: 1,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 6 },
  actionText: { fontSize: 13, fontWeight: '500' },

  emptyContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 40, gap: 12,
  },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtext: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  backHomeBtn: {
    marginTop: 8, backgroundColor: PURPLE,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  backHomeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});