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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { userId, userName } = useLocalSearchParams();
  const receiverId = Number(Array.isArray(userId) ? userId[0] : userId);
  const { authData } = useContext(AuthContext)!;
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUserId = authData?.user?.id;

  const fetchMessages = async (pageNum = 1, append = false) => {
    try {
      const res = await axios.get(
        `http://192.168.100.129:8000/api/messages/${receiverId}?page=${pageNum}`,
        { headers: { Authorization: `Bearer ${authData?.token}` } }
      );

      // Laravel paginate() returns { data: [], current_page, last_page, ... }
      const payload = res.data;
      const newMessages: any[] = Array.isArray(payload) ? payload : (payload.data ?? []);
      const lastPage: number = payload.last_page ?? 1;

      if (append) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }

      setHasMore(pageNum < lastPage);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error fetching messages:', error.response?.data ?? error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) fetchMessages(page + 1, true);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(1, false), 3000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      message: text,
      receiver_id: receiverId,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      temp: true,
    };
    setMessages(prev => [...prev, tempMessage]);
    setText('');
    flatListRef.current?.scrollToEnd({ animated: true });
    try {
      const res = await axios.post(
        `http://192.168.100.129:8000/api/messages`,
        { receiver_id: receiverId, message: text },
        { headers: { Authorization: `Bearer ${authData?.token}` } }
      );
      setMessages(prev => prev.map(msg => (msg.id === tempId ? res.data : msg)));
    } catch (error) {
      setMessages(prev =>
        prev.map(msg => (msg.id === tempId ? { ...msg, failed: true } : msg))
      );
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  /** Waveform bar heights for voice messages (decorative) */
  const WAVE_HEIGHTS = [6, 14, 10, 18, 8, 16, 12, 7, 20, 10, 14, 9, 16, 6, 12, 8, 18, 10, 14, 7];

  const renderVoiceMessage = (item: any, isMyMessage: boolean) => (
    <View
      style={[
        styles.voiceBubble,
        isMyMessage ? styles.myVoiceBubble : styles.theirVoiceBubble,
      ]}
    >
      {/* Play button */}
      <View style={[styles.playBtn, isMyMessage ? styles.myPlayBtn : styles.theirPlayBtn]}>
        <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 2 }} />
      </View>

      {/* Waveform */}
      <View style={styles.waveform}>
        {WAVE_HEIGHTS.map((h, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              { height: h },
              isMyMessage ? styles.myWaveBar : styles.theirWaveBar,
              i < 8 ? (isMyMessage ? styles.myWaveBarActive : styles.theirWaveBarActive) : null,
            ]}
          />
        ))}
      </View>

      {/* Duration + time */}
      <View style={styles.voiceMeta}>
        <Text style={[styles.voiceDuration, isMyMessage && styles.myVoiceText]}>
          {item.duration || '0:30'}
        </Text>
        <Text style={[styles.timeText, isMyMessage ? styles.myTimeText : styles.theirTimeText]}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.sender_id === currentUserId;
    const isVoice = item.type === 'voice';

    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        {isVoice ? (
          renderVoiceMessage(item, isMyMessage)
        ) : (
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.theirMessageText,
              ]}
            >
              {item.message}
            </Text>
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.timeText,
                  isMyMessage ? styles.myTimeText : styles.theirTimeText,
                ]}
              >
                {formatTime(item.created_at)}
              </Text>
              {isMyMessage && (
                <View style={styles.statusIcon}>
                  {item.temp ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                  ) : item.failed ? (
                    <Ionicons name="alert-circle" size={13} color="#FF3B30" />
                  ) : (
                    <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.8)" />
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!typing) return null;
    return (
      <View style={styles.typingRow}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDot} />
          <View style={[styles.typingDot, { opacity: 0.6 }]} />
          <View style={[styles.typingDot, { opacity: 0.3 }]} />
        </View>
      </View>
    );
  };

  /** Initials avatar from name */
  const getInitials = (name: string) => {
    const parts = String(name || 'U').trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(String(userName || 'U'))}</Text>
        </View>

        {/* Name + status */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{userName || 'User'}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active Now</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="videocam-outline" size={20} color="#6C5CE7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="call-outline" size={18} color="#6C5CE7" />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderMessage}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          onRefresh={() => { setRefreshing(true); fetchMessages(1, false); }}
          refreshing={refreshing}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color="#d0caff" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Say hello to start chatting!</Text>
            </View>
          }
          ListFooterComponent={renderTypingIndicator}
        />

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach" size={20} color="#6C5CE7" />
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
            />
          </View>

          <TouchableOpacity style={styles.emojiBtn}>
            <Ionicons name="happy-outline" size={20} color="#aaa" />
          </TouchableOpacity>

          {text.trim() ? (
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" style={{ marginLeft: 1 }} />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micBtn}>
              <Ionicons name="mic-outline" size={18} color="#6C5CE7" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */
const PURPLE = '#6C5CE7';
const PURPLE_LIGHT = '#f4f3ff';
const PURPLE_BORDER = '#e0dcff';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  headerBtn: { padding: 4 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PURPLE,
    borderWidth: 2,
    borderColor: PURPLE_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 14, fontWeight: '700', color: '#222' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34C759' },
  onlineText: { fontSize: 11, color: '#34C759', fontWeight: '500' },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PURPLE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Messages list */
  messagesList: { paddingHorizontal: 12, paddingVertical: 10, flexGrow: 1 },

  messageRow: { marginVertical: 3, flexDirection: 'row' },
  myMessageRow: { justifyContent: 'flex-end' },
  theirMessageRow: { justifyContent: 'flex-start' },

  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: PURPLE,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: { fontSize: 13.5, lineHeight: 19 },
  myMessageText: { color: '#fff' },
  theirMessageText: { color: '#222' },

  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: { fontSize: 10 },
  myTimeText: { color: 'rgba(255,255,255,0.55)' },
  theirTimeText: { color: '#bbb' },
  statusIcon: {},

  /* Voice bubble */
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
    maxWidth: '80%',
  },
  myVoiceBubble: {
    backgroundColor: PURPLE,
    borderBottomRightRadius: 4,
  },
  theirVoiceBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
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

  /* Typing */
  typingRow: { paddingHorizontal: 12, marginBottom: 6 },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PURPLE,
  },

  /* Input bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6,
  },
  attachBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PURPLE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    backgroundColor: PURPLE_LIGHT,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PURPLE_BORDER,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  textInput: {
    fontSize: 13.5,
    color: '#333',
    maxHeight: 86,
    padding: 0,
  },
  emojiBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PURPLE_LIGHT,
    borderWidth: 1,
    borderColor: PURPLE_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Empty state */
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 17, fontWeight: '500', color: '#999', marginTop: 14 },
  emptySubtext: { fontSize: 13, color: '#bbb', marginTop: 6 },
});