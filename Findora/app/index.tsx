import { Link } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Orbs */}
      <View style={[styles.orb, { width: 170, height: 170, top: -40, left: -45, backgroundColor: '#8b7ff0', opacity: 0.7 }]} />
      <View style={[styles.orb, { width: 90, height: 90, top: 55, right: 25, backgroundColor: '#d0cbff', opacity: 0.4 }]} />
      <View style={[styles.orb, { width: 130, height: 130, top: 200, right: -30, backgroundColor: '#4a3ab5', opacity: 0.85 }]} />
      <View style={[styles.orb, { width: 65, height: 65, top: 330, left: 15, backgroundColor: '#e0dcff', opacity: 0.3 }]} />
      <View style={[styles.orb, { width: 180, height: 180, bottom: 160, right: -45, backgroundColor: '#3b2ea0', opacity: 0.8 }]} />
      <View style={[styles.orb, { width: 70, height: 70, bottom: 230, left: 10, backgroundColor: '#bdb5ff', opacity: 0.3 }]} />

      {/* Logo */}
      <View style={styles.logoPill}>
        <Text style={styles.logoText}>Findora</Text>
      </View>

      {/* Center text */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Find what you lost.{'\n'}Return what you found.</Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>Campus Lost & Found</Text>
        </View>

        <View style={styles.btnRow}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.btnOutline}>
              <Text style={styles.btnOutlineText}>Sign in</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.btnSolid}>
              <Text style={styles.btnSolidText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C5CE7',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  logoPill: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    zIndex: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottom: {
    padding: 26,
    paddingBottom: 48,
    zIndex: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a8ffcb',
  },
  badgeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  btnOutlineText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  btnSolid: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  btnSolidText: {
    color: '#6C5CE7',
    fontSize: 15,
    fontWeight: '500',
  },
});