// app/(auth)/forgotPassword.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/config';
import { useTheme } from '@/utils/ThemeContext';

const PURPLE = '#6C5CE7';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Resend timer countdown
  const startTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1 — Send OTP
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email'); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/forgot-password`, { email });
      setStep('otp');
      startTimer();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP'); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/verify-otp`, { email, otp: otpString });
      setStep('password');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Reset Password
  const handleResetPassword = async () => {
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/reset-password`, {
        email,
        otp: otp.join(''),
        password,
        password_confirmation: confirmPassword,
      });
      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handler
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (!value && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const stepTitles = {
    email:    { title: 'Forgot Password?', subtitle: "Enter your email and we'll send you an OTP" },
    otp:      { title: 'Check Your Email', subtitle: `We sent a 6-digit OTP to ${email}` },
    password: { title: 'New Password',     subtitle: 'Create a strong new password' },
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => {
        if (step === 'email') router.back();
        else if (step === 'otp') setStep('email');
        else setStep('otp');
      }}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
          <View key={s} style={styles.stepRow}>
            <View style={[
              styles.stepDot,
              step === s && styles.stepDotActive,
              (step === 'otp' && i === 0) || (step === 'password' && i <= 1)
                ? styles.stepDotDone : null,
            ]}>
              {(step === 'otp' && i === 0) || (step === 'password' && i <= 1)
                ? <Ionicons name="checkmark" size={12} color="#fff" />
                : <Text style={[styles.stepNum, step === s && { color: '#fff' }]}>{i + 1}</Text>
              }
            </View>
            {i < 2 && <View style={[styles.stepLine,
              (step === 'otp' && i === 0) || (step === 'password' && i <= 1)
                ? styles.stepLineDone : { backgroundColor: colors.border }
            ]} />}
          </View>
        ))}
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: isDarkIcon(colors) }]}>
          <Ionicons
            name={step === 'email' ? 'mail-outline' : step === 'otp' ? 'key-outline' : 'lock-closed-outline'}
            size={28} color={PURPLE}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{stepTitles[step].title}</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>{stepTitles[step].subtitle}</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <Text style={[styles.label, { color: colors.subtext }]}>Email address</Text>
              <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={16} color={colors.icon} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.fieldInput, { color: colors.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />
              </View>
              <TouchableOpacity
                style={[styles.btn, loading && { opacity: 0.7 }]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Send OTP</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <>
              <Text style={[styles.label, { color: colors.subtext }]}>Enter 6-digit OTP</Text>
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => { otpRefs.current[index] = ref; }}
                    style={[styles.otpInput, {
                      backgroundColor: colors.input,
                      borderColor: digit ? PURPLE : colors.border,
                      color: colors.text,
                    }]}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val.slice(-1), index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>

              {/* Resend */}
              <View style={styles.resendRow}>
                <Text style={[styles.resendText, { color: colors.subtext }]}>{"Didn't receive it?"} </Text>
                <TouchableOpacity
                  onPress={() => { if (resendTimer === 0) handleSendOtp(); }}
                  disabled={resendTimer > 0}
                >
                  <Text style={[styles.resendLink, resendTimer > 0 && { color: colors.icon }]}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && { opacity: 0.7 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Verify OTP</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 'password' && (
            <>
              <Text style={[styles.label, { color: colors.subtext }]}>New password</Text>
              <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.icon} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.fieldInput, { color: colors.text }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={16} color={colors.icon}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.subtext, marginTop: 8 }]}>Confirm password</Text>
              <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.icon} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.fieldInput, { color: colors.text }]}
                  placeholder="Repeat password"
                  placeholderTextColor={colors.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={16} color={colors.icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Password strength */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3, 4].map(i => (
                    <View key={i} style={[styles.strengthBar, {
                      backgroundColor: i <= getStrength(password)
                        ? strengthColor(getStrength(password))
                        : colors.border,
                    }]} />
                  ))}
                  <Text style={[styles.strengthText, { color: strengthColor(getStrength(password)) }]}>
                    {['', 'Weak', 'Fair', 'Good', 'Strong'][getStrength(password)]}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, { marginTop: 20 }, loading && { opacity: 0.7 }]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Reset Password</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Helpers
const isDarkIcon = (colors: any) => colors.input;

const getStrength = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthColor = (score: number) => {
  return ['', '#ff4d4d', '#FFB300', '#2ecc71', '#6C5CE7'][score];
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { marginTop: 56, marginBottom: 8, width: 40, height: 40, justifyContent: 'center' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e4dff7', alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: PURPLE },
  stepDotDone: { backgroundColor: '#2ecc71' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#a89fd0' },
  stepLine: { width: 40, height: 2, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#2ecc71' },
  content: { flex: 1 },
  iconCircle: {
    width: 60, height: 60, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, lineHeight: 20, marginBottom: 24 },
  card: {
    borderRadius: 20, padding: 20,
    borderWidth: 0.5,
  },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, height: 48, marginBottom: 16,
  },
  fieldInput: { flex: 1, fontSize: 14 },
  btn: {
    height: 48, backgroundColor: PURPLE,
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  otpInput: {
    width: 46, height: 54, borderRadius: 12,
    borderWidth: 1.5, fontSize: 22, fontWeight: '700',
  },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  resendText: { fontSize: 13 },
  resendLink: { fontSize: 13, color: PURPLE, fontWeight: '600' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthText: { fontSize: 11, fontWeight: '600', width: 50 },
});