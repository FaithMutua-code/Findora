import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,

  AppState,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { createEcho } from '../../utils/echo';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { StatusBar } from "expo-status-bar";
import {API_URL } from '@/config';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function ChatScreen() {
  const { userId, userName } = useLocalSearchParams();
  const receiverId = Number(Array.isArray(userId) ? userId[0] : userId);
  const { authData } = useContext(AuthContext)!;
  const flatListRef = useRef<FlatList>(null);
  const echoRef = useRef<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);

  const currentUserId = authData?.user?.id;
  const token = authData?.token;

  // ─── Axios instance ───────────────────────────────────────────────
  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // ─── Fetch history ────────────────────────────────────────────────
  const fetchMessages = async (pageNum = 1, append = false) => {
    try {
      const res = await api.get(`/api/messages/${receiverId}?page=${pageNum}`);
      const payload = res.data;
      const newMessages: any[] = Array.isArray(payload) ? payload : (payload.data ?? []);
      const lastPage: number = payload.last_page ?? 1;

      if (append) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      }

      setHasMore(pageNum < lastPage);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data ?? err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ─── WebSocket ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !currentUserId) return;

    fetchMessages(1);

    const ids = [Number(currentUserId), Number(receiverId)].sort((a, b) => a - b);
    const channelName = `chat.${ids[0]}.${ids[1]}`;

    const echo = createEcho(token);
    echoRef.current = echo;

    echo.connector.pusher.connection.bind('connected', () => setConnected(true));
    echo.connector.pusher.connection.bind('disconnected', () => setConnected(false));

    echo
      .private(channelName)
      .listen('.message.sent', (data: any) => {
        setMessages(prev => {
          if (prev.find((m: any) => String(m.id) === String(data.id))) return prev;
          return [...prev, data];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);

        // Show notification only when app is backgrounded
        if (AppState.currentState !== 'active') {
          showLocalNotification(
            String(userName ?? 'New message'),
            data.message
          );
        }
      })
      .error((err: any) => {
        console.error('Channel error:', JSON.stringify(err));
      });

    return () => {
      echo.leave(channelName);
      echo.disconnect();
      echoRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUserId, receiverId]);

  // ─── Send message ─────────────────────────────────────────────────
  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');

    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      message: trimmed,
      sender_id: currentUserId,
      receiver_id: receiverId,
      created_at: new Date().toISOString(),
      temp: true,
    };

    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const socketId = echoRef.current?.socketId();
      const res = await api.post(
        '/api/messages',
        { receiver_id: receiverId, message: trimmed },
        { headers: socketId ? { 'X-Socket-ID': socketId } : {} }
      );
      setMessages(prev => prev.map(m => (m.id === tempId ? res.data : m)));
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, failed: true } : m))
      );
      console.error('Send error:', err.response?.data ?? err.message);
    } finally {
      setSending(false);
    }
  };

  // ─── Local notification (expo-notifications) ──────────────────────
  const showLocalNotification = async (title: string, body: string) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null, // show immediately
      });
    } catch (e) {
      console.warn('Notification error:', e);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    const parts = String(name || 'U').trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  const WAVE_HEIGHTS = [6, 14, 10, 18, 8, 16, 12, 7, 20, 10, 14, 9, 16, 6, 12, 8, 18, 10, 14, 7];

  // ─── Render ───────────────────────────────────────────────────────
  const renderVoiceMessage = (item: any, isMe: boolean) => (
    <View style={[styles.voiceBubble, isMe ? styles.myVoiceBubble : styles.theirVoiceBubble]}>
      <View style={[styles.playBtn, isMe ? styles.myPlayBtn : styles.theirPlayBtn]}>
        <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 2 }} />
      </View>
      <View style={styles.waveform}>
        {WAVE_HEIGHTS.map((h, i) => (
          <View key={i} style={[
            styles.waveBar, { height: h },
            isMe ? styles.myWaveBar : styles.theirWaveBar,
            i < 8 ? (isMe ? styles.myWaveBarActive : styles.theirWaveBarActive) : null,
          ]} />
        ))}
      </View>
      <View style={styles.voiceMeta}>
        <Text style={[styles.voiceDuration, isMe && styles.myVoiceText]}>
          {item.duration || '0:30'}
        </Text>
        <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = Number(item.sender_id) === Number(currentUserId);
    const isVoice = item.type === 'voice';

    return (
     
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
        {isVoice ? renderVoiceMessage(item, isMe) : (
          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
              {item.message}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                {formatTime(item.created_at)}
              </Text>
              {isMe && (
                <View style={styles.statusIcon}>
                  {item.temp && !item.failed
                    ? <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.5)" />
                    : item.failed
                    ? <Ionicons name="alert-circle" size={13} color="#FF3B30" />
                    : <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.8)" />
                  }
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
     <>
       <StatusBar style="light" backgroundColor="#6C5CE7" />
     
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(String(userName || 'U'))}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{userName || 'User'}</Text>
          <View style={styles.onlineRow}>
            <View style={[styles.onlineDot, { backgroundColor: connected ? '#34C759' : '#FFB300' }]} />
            <Text style={[styles.onlineText, { color: connected ? '#34C759' : '#FFB300' }]}>
              {connected ? 'Online' : 'Connecting...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="videocam-outline" size={20} color={PURPLE} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="call-outline" size={18} color={PURPLE} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          onEndReached={() => { if (hasMore && !loading) fetchMessages(page + 1, true); }}
          onEndReachedThreshold={0.1}
          onRefresh={() => { setRefreshing(true); fetchMessages(1, false); }}
          refreshing={refreshing}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color="#d0caff" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Say hello to start chatting!</Text>
            </View>
          }
        />

        {/* Input */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach" size={20} color={PURPLE} />
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder="Type your message..."
              placeholderTextColor="#aaa"
              multiline
              maxLength={1000}
              blurOnSubmit={false}
            />
          </View>
          {text.trim() ? (
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              disabled={sending}
            >
              {sending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={16} color="#fff" style={{ marginLeft: 1 }} />
              }
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micBtn}>
              <Ionicons name="mic-outline" size={18} color={PURPLE} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const PURPLE = '#6C5CE7';
const PURPLE_LIGHT = '#f4f3ff';
const PURPLE_BORDER = '#e0dcff';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', gap: 8,
  },
  headerBtn: { padding: 4 },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: PURPLE,
    borderWidth: 2, borderColor: PURPLE_BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 14, fontWeight: '700', color: '#222' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontSize: 11, fontWeight: '500' },
  actionBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center',
  },

  messagesList: { paddingHorizontal: 12, paddingVertical: 10, flexGrow: 1 },
  messageRow: { marginVertical: 3, flexDirection: 'row' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '75%', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18 },
  myMessage: { backgroundColor: PURPLE, borderBottomRightRadius: 4 },
  theirMessage: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  messageText: { fontSize: 13.5, lineHeight: 19 },
  myMessageText: { color: '#fff' },
  theirMessageText: { color: '#222' },
  messageFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', marginTop: 4, gap: 4,
  },
  timeText: { fontSize: 10 },
  myTimeText: { color: 'rgba(255,255,255,0.55)' },
  theirTimeText: { color: '#bbb' },
  statusIcon: {},

  voiceBubble: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 18,
    paddingHorizontal: 10, paddingVertical: 9, gap: 8, maxWidth: '80%',
  },
  myVoiceBubble: { backgroundColor: PURPLE, borderBottomRightRadius: 4 },
  theirVoiceBubble: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  playBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  myPlayBtn: { backgroundColor: 'rgba(255,255,255,0.25)' },
  theirPlayBtn: { backgroundColor: PURPLE },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
  waveBar: { width: 2.5, borderRadius: 2 },
  myWaveBar: { backgroundColor: 'rgba(255,255,255,0.35)' },
  theirWaveBar: { backgroundColor: 'rgba(108,92,231,0.25)' },
  myWaveBarActive: { backgroundColor: 'rgba(255,255,255,0.85)' },
  theirWaveBarActive: { backgroundColor: PURPLE },
  voiceMeta: { alignItems: 'flex-end', gap: 2 },
  voiceDuration: { fontSize: 11, fontWeight: '600', color: '#888' },
  myVoiceText: { color: 'rgba(255,255,255,0.75)' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: '#fff', borderTopWidth: 1,
    borderTopColor: '#f0f0f0', gap: 6,marginBottom:2,
  },
  attachBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center',
  },
  inputWrap: {
    flex: 1, backgroundColor: PURPLE_LIGHT, borderRadius: 20,
    borderWidth: 1, borderColor: PURPLE_BORDER,
    height: 60, paddingHorizontal: 14, paddingVertical: 7,
  },
  textInput: { fontSize: 13.5, color: '#333', maxHeight: 90, padding: 0 },
  emojiBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  micBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: PURPLE_LIGHT, borderWidth: 1,
    borderColor: PURPLE_BORDER, alignItems: 'center', justifyContent: 'center',
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 17, fontWeight: '500', color: '#999', marginTop: 14 },
  emptySubtext: { fontSize: 13, color: '#bbb', marginTop: 6 },
});