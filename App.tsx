import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import WelcomeScreen from './screens/WelcomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';

type AuthScreen = 'welcome' | 'signup' | 'login';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('welcome');

  useEffect(() => {
    // Safety net — never spin forever
    const timeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setSession(session);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Show spinner while checking session
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  // Already logged in — go straight to home
  if (session) {
    return <HomeScreen onSignOut={() => setSession(null)} />;
  }

  // Not logged in — show auth flow
  if (authScreen === 'signup') {
    return (
      <SignUpScreen
        onSignUp={() => {}}
        onSignIn={() => setAuthScreen('login')}
      />
    );
  }

  if (authScreen === 'login') {
    return (
      <LoginScreen
        onLogin={() => {}}
        onGetStarted={() => setAuthScreen('signup')}
      />
    );
  }

  return (
    <WelcomeScreen
      onGetStarted={() => setAuthScreen('signup')}
      onSignIn={() => setAuthScreen('login')}
    />
  );
}
