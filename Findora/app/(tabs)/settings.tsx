import React, { useContext,useState,useEffect } from 'react';
import {
    Alert,
    Switch,
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
import {API_URL } from '@/config';
import { useTheme } from '@/utils/ThemeContext';
export default function SettingsScreen() {
  const router = useRouter();
  const context = useContext(AuthContext);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme, colors } = useTheme();
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  const { authData, logout } = context;

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/logout`,
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
  const fetchUser = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/user`,
      {
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
      }
    );

    setUser(response.data);
  } catch (error) {
    console.log('Profile fetch error:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
    if (authData?.token) {
        fetchUser();
    }
}, [authData]);

  const settingsItems = [
    {
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () =>router.push('/profile/profile'),
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
       {
      title: 'Dark Mode',
      icon: 'moon-outline',
      right: (
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#e4dff7', true: '#6C5CE7' }}
          thumbColor={isDark ? '#fff' : '#f0eeff'}
        />
      ),
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
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Manage your account & preferences</Text>
    </View>

    {/* Profile Card */}
    <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={30} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: colors.text }]}>{loading ? 'Loading...' : user?.name || 'Your Name'}</Text>
        <Text style={[styles.email, { color: colors.subtext }]}>{loading ? 'Loading...' : user?.email || 'youremail@gmail.com'}</Text>
      </View>
    </View>

    {/* Settings List */}
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      {settingsItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.item, { borderBottomColor: colors.border }]}
          onPress={item.onPress}
        >
          <View style={styles.itemLeft}>
            <Ionicons name={item.icon as any} size={22} color="#6C5CE7" />
            <Text style={[styles.itemText, { color: colors.text }]}>{item.title}</Text>
          </View>
          {item.right
            ? item.right
            : <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          }
        </TouchableOpacity>
      ))}
    </View>

    {/* Logout */}
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
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