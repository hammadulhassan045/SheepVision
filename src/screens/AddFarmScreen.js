import React, {useState, useCallback} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AuthBrandHeader from '../components/AuthBrandHeader';
import {getSession} from '../services/authService';
import {createFarm} from '../services/farmService';
import {validateFarmForm} from '../utils/validation';

const COLORS = {
  background: '#F4F8F4',
  surface: '#FFFFFF',
  primary: '#176B4B',
  primaryLight: '#E5F1E8',
  heading: '#183D2F',
  text: '#62776B',
  border: '#DBE8DD',
  error: '#B74743',
};

const INITIAL_FORM = {
  name: '',
  address: '',
  district: '',
  province: '',
  country: 'Pakistan',
};

export default function AddFarmScreen({navigation}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = useCallback((field, value) => {
    setForm(previous => ({...previous, [field]: value}));
    setError('');
  }, []);

  const handleSave = useCallback(async () => {
    if (loading) return;

    const cleanedForm = {
      name: form.name.trim(),
      address: form.address.trim(),
      district: form.district.trim(),
      province: form.province.trim(),
      country: form.country.trim(),
    };

    const validationError = validateFarmForm(cleanedForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const session = await getSession();

      if (!session?.user_id) {
        throw new Error('Your session has expired. Please log in again.');
      }

      await createFarm({
        ...cleanedForm,
        ownerId: session.user_id,
      });

      navigation.navigate('MainTabs');
    } catch (err) {
      setError(err?.message || 'Unable to save farm details.');
    } finally {
      setLoading(false);
    }
  }, [form, loading, navigation]);

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
            <View style={styles.iconBadge}>
              <MaterialIcons
                name="agriculture"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.eyebrow}>LET'S GET STARTED</Text>
            <Text style={styles.title}>Set Up Your Farm</Text>
            <Text style={styles.subtitle}>
              Add your farm details to organize your sheep, track records, and
              manage your flock in one place.
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <Text style={styles.progressTitle}>Farm setup</Text>
              <Text style={styles.progressCount}>1 of 1</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialIcons
                  name="location-city"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>Farm Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Enter the basic details of your farm.
                </Text>
              </View>
            </View>

            <AppInput
              label="Farm Name"
              value={form.name}
              onChangeText={value => updateField('name', value)}
              placeholder="e.g. Green Valley Farm"
              leftElement={
                <MaterialIcons name="agriculture" size={20} color="#648074" />
              }
              error={error && !form.name.trim() ? error : null}
            />

            <AppInput
              label="Address"
              value={form.address}
              onChangeText={value => updateField('address', value)}
              placeholder="Street, village or area"
              leftElement={
                <MaterialIcons name="place" size={20} color="#648074" />
              }
              error={error && !form.address.trim() ? error : null}
            />

            <View style={styles.fieldRow}>
              <View style={styles.halfField}>
                <AppInput
                  label="District"
                  value={form.district}
                  onChangeText={value => updateField('district', value)}
                  placeholder="e.g. Sargodha"
                  error={error && !form.district.trim() ? error : null}
                />
              </View>

              <View style={styles.halfField}>
                <AppInput
                  label="Province"
                  value={form.province}
                  onChangeText={value => updateField('province', value)}
                  placeholder="e.g. Punjab"
                  error={error && !form.province.trim() ? error : null}
                />
              </View>
            </View>

            <AppInput
              label="Country"
              value={form.country}
              onChangeText={value => updateField('country', value)}
              placeholder="Country"
              leftElement={
                <MaterialIcons name="public" size={20} color="#648074" />
              }
              error={error && !form.country.trim() ? error : null}
            />

            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons
                  name="error-outline"
                  size={19}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AppButton
              title="Save & Continue"
              onPress={handleSave}
              loading={loading}
              style={styles.primaryButton}
            />

            <View style={styles.secureNote}>
              <MaterialIcons
                name="verified-user"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.secureText}>
                Your farm details stay linked to your account.
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>SHEEPVISION · SMARTER SHEEP FARMING</Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  intro: {
    alignItems: 'flex-start',
    marginTop: 22,
    marginBottom: 20,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 7,
  },
  title: {
    color: COLORS.heading,
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 340,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  progressTitle: {
    color: COLORS.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  progressCount: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    minWidth: 0,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF0EF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 54,
    marginTop: 4,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
  },
  secureText: {
    color: COLORS.text,
    fontSize: 11,
    flexShrink: 1,
  },
  footer: {
    textAlign: 'center',
    color: '#8A9A8F',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 22,
  },
});
