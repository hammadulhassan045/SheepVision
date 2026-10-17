import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import {registerUser} from '../services/authService';
import AuthBrandHeader from '../components/AuthBrandHeader';
import {validateRegisterForm} from '../utils/validation';

const COLORS = {
  background: '#F5F8F4',
  white: '#FFFFFF',
  green: '#176B4B',
  dark: '#173D2D',
  muted: '#718176',
  border: '#E4ECE4',
  lightGreen: '#E8F3E9',
  error: '#B74743',
  success: '#176B4B',
};

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
};

export default function RegisterScreen({navigation}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const updateValue = (key, value) => {
    setForm(current => ({...current, [key]: value}));
    if (error) setError('');
    if (notice) setNotice('');
  };

  const handleRegister = async () => {
    const validationError = validateRegisterForm(form);

    if (validationError) {
      setError(validationError);
      setNotice('');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await registerUser(form);

      setNotice(
        result?.session
          ? 'Account created successfully. Your farm setup is next.'
          : 'Check your email to confirm your account, then log in.',
      );
    } catch (err) {
      setError(err?.message || 'Unable to create your account right now.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: 'fullName',
      label: 'Full name',
      placeholder: 'Enter your full name',
      icon: 'person-outline',
      props: {autoCapitalize: 'words', autoCorrect: false},
    },
    {
      key: 'email',
      label: 'Email address',
      placeholder: 'you@example.com',
      icon: 'mail-outline',
      props: {
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        autoCorrect: false,
      },
    },
    {
      key: 'phone',
      label: 'Phone number',
      placeholder: '+92 300 0000000',
      icon: 'phone-iphone',
      props: {keyboardType: 'phone-pad'},
    },
  ];

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
          {/* Form introduction */}
          <View style={styles.intro}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Start managing your sheep farm smarter.
            </Text>
          </View>

          {/* Registration form */}
          <View style={styles.formCard}>
            <View style={styles.cardHeading}>
              <View>
                <Text style={styles.formTitle}>Your details</Text>
                <Text style={styles.formSubtitle}>
                  Fill in the information below
                </Text>
              </View>

              <View style={styles.formIcon}>
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={23}
                  color={COLORS.green}
                />
              </View>
            </View>

            {fields.map(field => (
              <AppInput
                key={field.key}
                label={field.label}
                value={form[field.key]}
                onChangeText={value => updateValue(field.key, value)}
                placeholder={field.placeholder}
                leftElement={
                  <MaterialIcons
                    name={field.icon}
                    size={20}
                    color={COLORS.muted}
                  />
                }
                {...field.props}
              />
            ))}

            <AppInput
              label="Password"
              value={form.password}
              onChangeText={value => updateValue('password', value)}
              placeholder="At least 6 characters"
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
                  onPress={() => setShowPassword(current => !current)}
                  hitSlop={8}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              }
            />

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
              <View style={[styles.messageBox, styles.successBox]}>
                <MaterialIcons
                  name="check-circle-outline"
                  size={19}
                  color={COLORS.success}
                />
                <Text style={styles.notice}>{notice}</Text>
              </View>
            ) : null}

            <AppButton
              title="Create Account"
              onPress={handleRegister}
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
                Your account details are required to get started.
              </Text>
            </View>
          </View>

          {/* Login link */}
          <View style={styles.loginAction}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
              hitSlop={8}>
              <Text style={styles.loginLink}>Log in</Text>
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
  topRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: COLORS.dark,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 40,
  },
  intro: {
    marginBottom: 22,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
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
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
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
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF0EF',
    borderRadius: 12,
    padding: 11,
    marginTop: 5,
    marginBottom: 10,
  },
  error: {
    flex: 1,
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: '#EAF5EC',
  },
  notice: {
    flex: 1,
    color: COLORS.success,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 54,
    marginTop: 8,
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
  loginAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 50,
    marginTop: 10,
  },
  loginPrompt: {
    color: COLORS.muted,
    fontSize: 12,
  },
  loginLink: {
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
