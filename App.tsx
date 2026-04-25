import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from './lib/supabase';
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

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      if (session) {
        const hasOnboarded = session.user.user_metadata?.onboarded === true;
        setNeedsOnboarding(!hasOnboarded);
      }
      setSession(session);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const hasOnboarded = session.user.user_metadata?.onboarded === true;
        setNeedsOnboarding(!hasOnboarded);
      }
      setSession(session);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleOnboardingComplete = async (answers: OnboardingAnswers) => {
    // Save answers to user metadata and mark as onboarded
    await supabase.auth.updateUser({
      data: { onboarded: true, onboarding: answers },
    });
    setNeedsOnboarding(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  if (session) {
    if (needsOnboarding) {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
    const userName = session.user.user_metadata?.full_name?.split(' ')[0] ?? 'there';
    return <HomeScreen userName={userName} onSignOut={() => setSession(null)} />;
  }

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
