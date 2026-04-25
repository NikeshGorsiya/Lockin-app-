import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { supabase } from './lib/supabase';
import { generateTasksFromOnboarding, type Task } from './lib/claude';
import type { Session } from '@supabase/supabase-js';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen, { type OnboardingAnswers } from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';

type AuthScreen = 'welcome' | 'signup' | 'login';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('welcome');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      if (session) {
        const meta = session.user.user_metadata;
        setNeedsOnboarding(meta?.onboarded !== true);
        if (meta?.tasks) setTasks(meta.tasks);
      }
      setSession(session);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const meta = session.user.user_metadata;
        setNeedsOnboarding(meta?.onboarded !== true);
        if (meta?.tasks) setTasks(meta.tasks);
      }
      setSession(session);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleOnboardingComplete = async (answers: OnboardingAnswers) => {
    setGeneratingTasks(true);
    try {
      const generated = await generateTasksFromOnboarding(answers);
      setTasks(generated);
      await supabase.auth.updateUser({
        data: { onboarded: true, onboarding: answers, tasks: generated },
      });
    } catch (e) {
      // Fallback tasks if Claude fails
      setTasks([
        { id: 1, emoji: '💪', title: 'Morning workout', proof: false },
        { id: 2, emoji: '📚', title: 'Read for 30 minutes', proof: false },
        { id: 3, emoji: '🧘', title: 'Meditate for 10 minutes', proof: false },
        { id: 4, emoji: '💧', title: 'Drink 2L of water', proof: false },
        { id: 5, emoji: '✍️', title: 'Write in your journal', proof: false },
      ]);
      await supabase.auth.updateUser({ data: { onboarded: true } });
    }
    setNeedsOnboarding(false);
    setGeneratingTasks(false);
  };

  // Spinner while checking session
  if (loading) {
    return <Spinner message="Loading..." />;
  }

  // Spinner while Claude generates tasks
  if (generatingTasks) {
    return <Spinner message={`Building your personal task list...`} sub="Claude is reading your answers ✨" />;
  }

  if (session) {
    if (needsOnboarding) {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
    const userName = session.user.user_metadata?.full_name?.split(' ')[0] ?? 'there';
    return <HomeScreen userName={userName} userId={session.user.id} tasks={tasks} onSignOut={() => setSession(null)} />;
  }

  if (authScreen === 'signup') {
    return <SignUpScreen onSignUp={() => {}} onSignIn={() => setAuthScreen('login')} />;
  }

  if (authScreen === 'login') {
    return <LoginScreen onLogin={() => {}} onGetStarted={() => setAuthScreen('signup')} />;
  }

  return (
    <WelcomeScreen
      onGetStarted={() => setAuthScreen('signup')}
      onSignIn={() => setAuthScreen('login')}
    />
  );
}

function Spinner({ message, sub }: { message: string; sub?: string }) {
  return (
    <View style={styles.spinner}>
      <ActivityIndicator size="large" color="#4ade80" />
      <Text style={styles.spinnerText}>{message}</Text>
      {sub && <Text style={styles.spinnerSub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  spinner: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  spinnerText: { color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  spinnerSub: { color: '#71717a', fontSize: 14, textAlign: 'center' },
});
