import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

export default function WelcomeScreen({ onGetStarted, onSignIn }: Props) {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>

        {/* Logo */}
        <View style={s.logoSection}>
          <View style={s.logoBox}>
            <Text style={s.logoText}>L</Text>
          </View>
          <Text style={s.appName}>LOCKIN</Text>
          <Text style={s.tagline}>Stop lying to yourself.{'\n'}Prove you did it.</Text>
        </View>

        {/* Features */}
        <View style={s.features}>
          {[
            { emoji: '📸', text: 'Upload photo proof of every habit' },
            { emoji: '🤖', text: 'AI verifies you actually did it' },
            { emoji: '👥', text: 'Friends hold you accountable' },
            { emoji: '🔥', text: 'Build streaks, earn points, level up' },
          ].map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureEmoji}>{f.emoji}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={s.buttons}>
          <TouchableOpacity style={s.primaryBtn} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Get started — it's free</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={onSignIn} activeOpacity={0.85}>
            <Text style={s.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 20, justifyContent: 'space-between' },

  logoSection: { alignItems: 'center', gap: 12 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#4ade80', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 36, fontWeight: '900', color: '#000' },
  appName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 6 },
  tagline: { fontSize: 18, color: '#71717a', textAlign: 'center', lineHeight: 26 },

  features: { gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#141414', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#222' },
  featureEmoji: { fontSize: 24 },
  featureText: { color: '#d4d4d8', fontSize: 15, fontWeight: '500', flex: 1 },

  buttons: { gap: 12 },
  primaryBtn: { backgroundColor: '#4ade80', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 17 },
  secondaryBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  secondaryBtnText: { color: '#71717a', fontWeight: '600', fontSize: 15 },
});
