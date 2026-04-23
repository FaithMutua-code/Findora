import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState,useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';

import { AuthContext } from '@/utils/AuthContext';

export default function ItemScreen() {
  const { id } = useLocalSearchParams();
  const { authData } = useContext(AuthContext)!;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://192.168.100.129:8000/api/items/${id}`, {
      headers: { Authorization: `Bearer ${authData?.token}` },
    })
    .then(res => setItem(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>{item?.title}</Text>
      <Text style={{ marginTop: 8, color: '#666' }}>{item?.description}</Text>
    </View>
  );
}