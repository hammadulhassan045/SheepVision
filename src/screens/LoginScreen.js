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

const COLORS = {
  background: '#F5F8F4',
  white: '#FFFFFF',
  green: '#176B4B',
  dark: '#173D2D',
  muted: '#718176',
  border: '#E4ECE4',
  lightGreen: '#E8F3E9',
  error: '#B74743',
};

export default function LoginScreen({navigation}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(REMEMBERED_IDENTIFIER_KEY)
      .then(savedIdentifier => {
        if (mounted && savedIdentifier) {
          setIdentifier(savedIdentifier);
          setRememberMe(true);
        }
      })
      .catch(storageError => {
        console.warn('Unable to load saved login', storageError);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const clearMessages = () => {
    setError('');
    setNotice('');
  };

  const handleLogin = async () => {
    const validationMessage = validateLoginForm({identifier, password});

    if (validationMessage) {
      setError(validationMessage);
      setNotice('');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      if (rememberMe) {
        await AsyncStorage.setItem(
          REMEMBERED_IDENTIFIER_KEY,
          identifier.trim(),
        );
      } else {
        await AsyncStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
      }

      await signIn({identifier: identifier.trim(), password});
    } catch (err) {
      setError(err?.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = identifier.trim();

    if (!email.includes('@')) {
      setError('Enter your account email to continue.');
      setNotice('');
      return;
    }

    setError('');
    setNotice(
      'Password recovery is not available yet. Please contact your farm administrator.',
    );
  };

  const updateIdentifier = value => {
    setIdentifier(value);
    clearMessages();
  };

  const updatePassword = value => {
    setPassword(value);
    clearMessages();
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
          <AuthBrandHeader navigation={navigation} />

          <View style={styles.intro}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>WELCOME BACK</Text>
            </View>

            <Text style={styles.title}>Let's get you in.</Text>
            <Text style={styles.subtitle}>
              Sign in to continue managing your flock.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.cardHeading}>
              <View>
                <Text style={styles.formTitle}>Sign in</Text>
                <Text style={styles.formSubtitle}>
                  Enter your account details
                </Text>
              </View>

              <View style={styles.formIcon}>
                <MaterialIcons
                  name="lock-open"
                  size={23}
                  color={COLORS.green}
                />
              </View>
            </View>

            <AppInput
              label="Email or Phone"
              value={identifier}
              onChangeText={updateIdentifier}
              placeholder="Enter email or phone"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              leftElement={
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color={COLORS.muted}
                />
              }
            />

            <AppInput
              label="Password"
              value={password}
              onChangeText={updatePassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              leftElement={
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color={COLORS.muted}
                />
              }
              rightElement={
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  onPress={() => setShowPassword(value => !value)}
                  hitSlop={8}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
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
                  color={rememberMe ? COLORS.green : '#83958A'}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>

              <TouchableOpacity
                accessibilityRole="button"
                disabled={loading}
                onPress={handleForgotPassword}
                activeOpacity={0.7}>
                <Text style={styles.linkText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.messageBox}>
                <MaterialIcons
                  name="error-outline"
                  size={19}
                  color={COLORS.error}
                />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            {notice ? (
              <View style={[styles.messageBox, styles.noticeBox]}>
                <MaterialIcons
                  name="info-outline"
                  size={19}
                  color={COLORS.green}
                />
                <Text style={styles.notice}>{notice}</Text>
              </View>
            ) : null}

            <AppButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={styles.primaryButton}
            />

            <View style={styles.secureNote}>
              <MaterialIcons
                name="verified-user"
                size={15}
                color={COLORS.muted}
              />
              <Text style={styles.secureText}>
                Sign in securely to access your farm.
              </Text>
            </View>
          </View>

          <View style={styles.registerAction}>
            <Text style={styles.registerPrompt}>New to SheepVision?</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
              hitSlop={8}>
              <Text style={styles.registerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>SMARTER CARE. HEALTHIER FLOCKS.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 18,
  },
  intro: {
    marginTop: 8,
    marginBottom: 22,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.lightGreen,
    marginBottom: 12,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  eyebrowText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: COLORS.dark,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#244A34',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.045,
    shadowRadius: 14,
    elevation: 2,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 19,
  },
  formTitle: {
    color: COLORS.dark,
    fontSize: 17,
    fontWeight: '800',
  },
  formSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  formIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: -2,
    marginBottom: 9,
  },
  rememberAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    color: '#566C60',
    fontSize: 12,
  },
  linkText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '700',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#FFF0EF',
    marginBottom: 10,
  },
  error: {
    flex: 1,
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
  },
  noticeBox: {
    backgroundColor: COLORS.lightGreen,
  },
  notice: {
    flex: 1,
    color: COLORS.green,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 54,
    marginTop: 7,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 13,
  },
  secureText: {
    color: COLORS.muted,
    fontSize: 10,
  },
  registerAction: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  registerPrompt: {
    color: COLORS.muted,
    fontSize: 12,
  },
  registerLink: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    textAlign: 'center',
    color: '#91A094',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 3,
  },
});
