
import { View, Text,ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
    <ScrollView>
        {/* Background Design */}
      <View style={styles.topGradient} />
      
      {/* Logo and Title */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
        <Text style={styles.title}>Lost & Found</Text>
        <Text style={styles.subtitle}>Campus App</Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔍</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Find Lost Items</Text>
            <Text style={styles.featureDescription}>
              Browse through lost items reported by fellow students
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📸</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Report Found Items</Text>
            <Text style={styles.featureDescription}>
              Help others by posting items you&apos;ve found on campus
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🤝</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Connect & Reunite</Text>
            <Text style={styles.featureDescription}>
              Contact owners and return lost items to their rightful owners
            </Text>
          </View>
        </View>
      </View>

    
    

       

     
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    opacity: 0.1,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 60,
    color: '#fff',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    marginTop: 5,
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 40,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    width: 50,
    textAlign: 'center',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonsSection: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
});