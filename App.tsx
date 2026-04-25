import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';

type Screen = 'welcome' | 'signup' | 'login' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => setScreen('signup')}
        onSignIn={() => setScreen('login')}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignUpScreen
        onSignUp={() => setScreen('home')}
        onSignIn={() => setScreen('login')}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={() => setScreen('home')}
        onGetStarted={() => setScreen('signup')}
      />
    );
  }

  return <HomeScreen onSignOut={() => setScreen('welcome')} />;
}
