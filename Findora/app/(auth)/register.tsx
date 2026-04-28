import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../utils/AuthContext';
import axios from 'axios';
import {API_URL } from '@/config';
import { Ionicons } from '@expo/vector-icons';
export default function RegisterScreen() {
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const[showPassword, setShowPassword] =useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
const context = useContext(AuthContext);
  if (!context) {
    throw new Error('LoginScreen must be used within AuthProvider');
  }
  const { setAuthData } = context;

  const validateForm = () => {
    // Email validation
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }

    // Username validation
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return false;
    }

    // Password validation
    if (!formData.password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }

    // Confirm password
    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(
      `${API_URL}/api/register`,
      {
        name: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const resData = response.data;
    if (resData.token) {
      setAuthData(resData);
      router.replace("/(tabs)");
    } else {
      Alert.alert('Registration Failed', resData.message || 'Registration failed');
    }
  } catch (error: any) {
    console.log('❌ Registration failed:', error);
    
    // Show user-friendly error message
    let errorMessage = 'Could not register. Please try again.';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || 
                     error.response.data?.errors ? 
                     Object.values(error.response.data.errors).flat().join('\n') : 
                     `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response
      errorMessage = 'No response from server. Check your connection.';
    } else {
      // Something else happened
      errorMessage = error.message || 'Registration failed';
    }
    
    Alert.alert('Registration Failed', errorMessage);
  } finally {
    setLoading(false);
  }
};
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Lost & Found Campus</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              autoComplete="email"
              importantForAutofill="yes"
            />
               <TextInput
              style={styles.input}
              placeholder="Username"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
              autoCapitalize="none"
              editable={!loading}
              autoComplete="username"
            />


            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              value={formData.phone_number}
              onChangeText={(text) => setFormData({...formData, phone_number: text})}
              keyboardType="phone-pad"
              editable={!loading}
            />

           <View style={styles.inputWrapper}>
  <TextInput
    style={styles.inputFlex}
    placeholder="Password"
    value={formData.password}
    onChangeText={(text) => setFormData({...formData, password: text})}
    secureTextEntry={!showPassword}
    editable={!loading}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
  </TouchableOpacity>
</View>

<View style={styles.inputWrapper}>
  <TextInput
    style={styles.inputFlex}
    placeholder="Confirm Password"
    value={formData.password_confirmation}
    onChangeText={(text) => setFormData({...formData, password_confirmation: text})}
    secureTextEntry={!showConfirmPassword}
    editable={!loading}
  />
  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
    <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
  </TouchableOpacity>
</View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    height: 50,
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  marginBottom: 15,
  backgroundColor: '#fafafa',
  paddingHorizontal: 15,
},
inputFlex: {
  flex: 1,
  height: 50,
  fontSize: 16,
},
eyeBtn: {
  padding: 4,
},
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#6C5CE7',
    fontSize: 16,
  },
  loginLink: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: '600',
  },
});