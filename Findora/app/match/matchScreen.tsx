import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect, useState,useContext } from "react";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from '@/utils/AuthContext';
import { API_URL } from "@/config";
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar";
type Item = {
  id: number;
  title: string;
  description: string;
  location: string;
};

type Match = {
  item: Item;
  score: number;
};

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const context = useContext(AuthContext);
  const { authData } = context!;
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
    setMatches(response.data); // ← directly, no () call
  } catch (error) {
    console.error("Error fetching matches:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (id) fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading matches...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#6C5CE7" />
      <Text style={styles.title}>Possible Matches 🔍</Text>

      {matches.length === 0 ? (
        <Text>No matches found 😢</Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.bold}>{item.item.title}</Text>
              <Text>{item.item.description}</Text>
              <Text>📍 {item.item.location}</Text>
              <Text style={styles.score}>🔥 Match: {item.score}%</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  item: {
    backgroundColor: "#eee",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  score: {
    marginTop: 5,
    color: "#6C5CE7", // your theme 🔥
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});