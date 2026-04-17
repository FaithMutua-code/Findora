import React, { useContext } from 'react';
import {
    Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/utils/AuthContext';

const getApiBaseUrl = () => {

  return 'http://192.168.100.129:8000';
 
};
export default function SettingsScreen() {
  const router = useRouter();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  const { authData, logout } = context;

  const handleLogout = async () => {
    try {
      await axios.post(
        `${getApiBaseUrl()}/api/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        }
      );

      logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.log(error);
    }
  };

  const settingsItems = [
    {
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => {},
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => {},
    },
    {
      title: 'Privacy & Security',
      icon: 'lock-closed-outline',
      onPress: () => {},
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => {},
    },
    {
      title: 'About App',
      icon: 'information-circle-outline',
      onPress: () => {},
    },
  ];

  const confirmLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: handleLogout,
      },
    ]
  );
};

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account & preferences</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={30} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Your Name</Text>
          <Text style={styles.email}>youremail@gmail.com</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      {/* Settings List */}
      <View style={styles.section}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={item.onPress}
          >
            <View style={styles.itemLeft}>
              <Ionicons name={item.icon as any} size={22} color="#6C5CE7" />
              <Text style={styles.itemText}>{item.title}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}
      onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    padding: 20,
    paddingTop: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },

  email: {
    fontSize: 12,
    color: '#666',
  },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  itemText: {
    fontSize: 15,
    color: '#222',
  },

  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4d4d',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});