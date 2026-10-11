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
import {MaterialIcons} from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AuthBrandHeader from '../components/AuthBrandHeader';
import {registerUser} from '../services/authService';
import {validateRegisterForm} from '../utils/validation';

export default function RegisterScreen({navigation}) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateValue = (key, value) => {
    setForm(previous => ({...previous, [key]: value}));
  };

  const handleRegister = async () => {
    const validationError = validateRegisterForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await registerUser(form);
      setNotice(
        result?.session
          ? 'Account created. Your farm setup is next.'
          : 'Check your email to confirm your account, then log in to set up your farm.',
      );
    } catch (err) {
      setError(err?.message || 'Unable to create your account right now.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.eyebrow}>START WITH YOUR ACCOUNT</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join SheepVision and start managing your farm smarter.
          </Text>

          <View style={styles.form}>
            <AppInput
              label="Full Name"
              value={form.fullName}
              onChangeText={value => updateValue('fullName', value)}
              placeholder="Your full name"
              leftElement={
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color="#648074"
                />
              }
            />
            <AppInput
              label="Email"
              value={form.email}
              keyboardType="email-address"
              onChangeText={value => updateValue('email', value)}
              placeholder="you@example.com"
              autoCapitalize="none"
              leftElement={
                <MaterialIcons name="mail-outline" size={20} color="#648074" />
              }
            />
            <AppInput
              label="Phone"
              value={form.phone}
              keyboardType="phone-pad"
              onChangeText={value => updateValue('phone', value)}
              placeholder="+92 300 0000000"
              leftElement={
                <MaterialIcons name="phone-iphone" size={20} color="#648074" />
              }
            />
            <AppInput
              label="Password"
              value={form.password}
              onChangeText={value => updateValue('password', value)}
              placeholder="At least 6 characters"
              secureTextEntry={!showPassword}
              leftElement={
                <MaterialIcons name="lock-outline" size={20} color="#648074" />
              }
              rightElement={
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  onPress={() => setShowPassword(value => !value)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#648074"
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <AppButton
            title="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginAction}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <Text style={styles.loginLink}>Login</Text>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
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
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  form: {
    marginBottom: 4,
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
    marginTop: 6,
  },
  loginAction: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  loginPrompt: {
    color: '#657B6F',
    fontSize: 13,
  },
  loginLink: {
    color: '#176B4B',
    fontSize: 13,
    fontWeight: '700',
  },
});
