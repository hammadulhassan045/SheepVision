import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AuthBrandHeader from '../components/AuthBrandHeader';
import {signIn} from '../services/authService';
import {validateLoginForm} from '../utils/validation';

const REMEMBERED_IDENTIFIER_KEY = 'sheepvision.remembered.identifier';

export default function LoginScreen({navigation}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(REMEMBERED_IDENTIFIER_KEY)
      .then(savedIdentifier => {
        if (savedIdentifier) {
          setIdentifier(savedIdentifier);
          setRememberMe(true);
        }
      })
      .catch(storageError =>
        console.warn('Unable to load saved login', storageError),
      );
  }, []);

  const handleLogin = async () => {
    const validationMessage = validateLoginForm({identifier, password});
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (rememberMe) {
        await AsyncStorage.setItem(
          REMEMBERED_IDENTIFIER_KEY,
          identifier.trim(),
        );
      } else {
        await AsyncStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
      }
      await signIn({identifier, password});
    } catch (err) {
      setError(err?.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = identifier.trim();
    if (!email.includes('@')) {
      setError('Enter your account email to receive password reset instructions.');
      return;
    }

    setNotice('Password reset is managed by your farm administrator or by a future account recovery flow.');
    setError('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AuthBrandHeader
            navigation={navigation}
            showBack={navigation.canGoBack()}
          />
          <Text style={styles.eyebrow}>YOUR FARM, IN FOCUS</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.form}>
            <AppInput
              label="Email or Phone"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              leftElement={
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color="#648074"
                />
              }
            />
            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              leftElement={
                <MaterialIcons name="lock-outline" size={20} color="#648074" />
              }
            />

            <View style={styles.optionsRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{checked: rememberMe}}
                onPress={() => setRememberMe(value => !value)}
                style={styles.rememberAction}>
                <MaterialIcons
                  name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={rememberMe ? '#176B4B' : '#83958A'}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={loading}
                onPress={handleForgotPassword}>
                <Text style={styles.linkText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <AppButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate('Register')}
            style={styles.createAction}>
            <Text style={styles.createPrompt}>New to SheepVision?</Text>
            <Text style={styles.linkText}>Create New Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8F4',
  },
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  eyebrow: {
    color: '#4E8068',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: '#183D2F',
    fontSize: 31,
    fontWeight: '800',
    marginBottom: 5,
  },
  subtitle: {
    color: '#62776B',
    fontSize: 15,
    marginBottom: 26,
  },
  form: {
    marginBottom: 8,
  },
  optionsRow: {
    minHeight: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -2,
  },
  rememberAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  rememberText: {
    color: '#566C60',
    fontSize: 13,
  },
  linkText: {
    color: '#176B4B',
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    color: '#B74743',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  notice: {
    color: '#176B4B',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 56,
    marginTop: 8,
  },
  createAction: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
  },
  createPrompt: {
    color: '#657B6F',
    fontSize: 13,
  },
});
