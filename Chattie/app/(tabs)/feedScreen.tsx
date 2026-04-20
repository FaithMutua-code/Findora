import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../../utils/AuthContext';
type User = {
  id: number;
  name: string;
};

type Item = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  type: 'lost' | 'found';
  image?: string;
  user?: User;
};
const getApiBaseUrl = () => {

  return 'http://192.168.100.129:8000';
 
};
export default function FeedScreen() {
 const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const context = useContext(AuthContext);
    if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  const { authData} = context;

  const fetchItems = async () => {
    try {
    const res = await axios.get(`${getApiBaseUrl()}/api/items`, {
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
      });

      setItems(res.data.items);
    } catch (error:unknown) {
  const err = error as any;

  console.log('Feed error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }
const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>

      {/* USER INFO */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            {item.user?.name?.charAt(0)}
          </Text>
        </View>

        <View>
          <Text style={styles.username}>{item.user?.name}</Text>
          <Text style={styles.type}>
            {item.type === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}
          </Text>
        </View>
      </View>

      {/* IMAGE */}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>

        <Text style={styles.location}>📍 {item.location}</Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={22} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={22} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  username: {
    fontWeight: 'bold',
    color: '#333',
  },

  type: {
    fontSize: 12,
    color: '#666',
  },

  image: {
    width: '100%',
    height: 250,
  },

  content: {
    padding: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  desc: {
    color: '#555',
    marginTop: 5,
  },

  location: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  actionBtn: {
    padding: 5,
  },
});