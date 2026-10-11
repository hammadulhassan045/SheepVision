import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {getSession, subscribeToAuthChanges} from '../services/authService';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';

const SPLASH_DURATION = 1600;

export default function RootNavigator() {
  const [session, setSession] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [splashElapsed, setSplashElapsed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = nextSession => {
      if (isMounted) {
        setSession(nextSession);
      }
    };

    const bootstrapSession = async () => {
      try {
        const initialSession = await getSession();

        if (isMounted) {
          setSession(initialSession);
        }
      } catch (error) {
        console.warn('Session bootstrap failed', error);

        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    };

    const splashTimer = setTimeout(
      () => setSplashElapsed(true),
      SPLASH_DURATION,
    );

    const unsubscribe = subscribeToAuthChanges(handleAuthChange);

    bootstrapSession();

    return () => {
      isMounted = false;
      clearTimeout(splashTimer);
      unsubscribe();
    };
  }, []);

  const isLoading = bootstrapping || !splashElapsed;

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {session ? (
        <MainNavigator />
      ) : (
        <AuthNavigator initialRouteName="Onboarding" />
      )}
    </NavigationContainer>
  );
}
