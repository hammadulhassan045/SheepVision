import {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {getSession, subscribeToAuthChanges} from '../services/authService';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';

const SPLASH_DURATION = 1600;

export default function RootNavigator() {
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let isActive = true;

    const initializeSession = async () => {
      try {
        const currentSession = await getSession();

        if (isActive) {
          setSession(currentSession);
        }
      } catch (error) {
        console.warn('Failed to initialize session:', error);

        if (isActive) {
          setSession(null);
        }
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    };

    const unsubscribe = subscribeToAuthChanges(nextSession => {
      if (isActive) {
        setSession(nextSession);
      }
    });

    const splashTimer = setTimeout(() => {
      if (isActive) {
        setShowSplash(false);
      }
    }, SPLASH_DURATION);

    initializeSession();

    return () => {
      isActive = false;
      clearTimeout(splashTimer);
      unsubscribe();
    };
  }, []);

  if (isInitializing || showSplash) {
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
