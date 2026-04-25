import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Props = {
  onSignUp: () => void;
  onSignIn: () => void;
};

export default function SignUpScreen({ onSignUp, onSignIn }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
    }
    // On success, App.tsx detects the new session automatically via onAuthStateChange
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <View style={s.logoRow}>
              <View style={s.logoBox}>
                <Text style={s.logoText}>L</Text>
              </View>
              <Text style={s.appName}>LOCKIN</Text>
            </View>
            <Text style={s.title}>Create your account</Text>
            <Text style={s.subtitle}>Start proving yourself today</Text>
          </View>

          <View style={s.form}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>Full name</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Nikesh Gorsiya"
                placeholderTextColor="#3f3f46"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Email address</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor="#3f3f46"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Password</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#3f3f46"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={s.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#000" />
                : <Text style={s.primaryBtnText}>Create account</Text>
              }
            </TouchableOpacity>

            <Text style={s.terms}>
              By signing up you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSignIn}>
              <Text style={s.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, gap: 32 },

  header: { gap: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  logoBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#4ade80', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#000' },
  appName: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 15, color: '#71717a' },

  form: { gap: 20 },
  fieldGroup: { gap: 8 },
  label: { color: '#a1a1aa', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  input: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#27272a', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, color: '#fff', fontSize: 16 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eyeBtn: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#27272a', borderRadius: 14, padding: 16 },
  eyeText: { fontSize: 18 },

  primaryBtn: { backgroundColor: '#4ade80', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 17 },
  terms: { color: '#3f3f46', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#71717a', fontSize: 15 },
  footerLink: { color: '#4ade80', fontSize: 15, fontWeight: '700' },
});
