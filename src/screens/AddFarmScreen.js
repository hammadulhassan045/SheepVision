import React, {useState} from 'react';
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

export default function AddFarmScreen({navigation}) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    district: '',
    province: '',
    country: 'Pakistan',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) =>
    setForm(prev => ({...prev, [field]: value}));

  const handleSave = async () => {
    const validationError = validateFarmForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const session = await getSession();
      if (!session?.user_id) {
        throw new Error('Your session is no longer active. Please log in again.');
      }

      const farmDetails = {
        name: form.name,
        address: form.address,
        district: form.district,
        province: form.province,
        country: form.country,
        ownerId: session.user_id,
      };

      await createFarm(farmDetails);

      navigation.navigate('MainTabs');
    } catch (err) {
      setError(err?.message || 'Unable to save farm details.');
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
          <AuthBrandHeader />
          <View style={styles.stepHeader}>
            <Text style={styles.eyebrow}>FARM SETUP · STEP 1 OF 1</Text>
            <View style={styles.stepTrack}>
              <View style={styles.stepProgress} />
            </View>
          </View>
          <Text style={styles.title}>Add Your Farm</Text>
          <Text style={styles.subtitle}>Tell us about your farm</Text>

          <AppInput
            label="Farm Name"
            value={form.name}
            onChangeText={value => updateField('name', value)}
            placeholder="e.g. Green Valley Farm"
            leftElement={
              <MaterialIcons name="agriculture" size={20} color="#648074" />
            }
            error={error && !form.name ? error : null}
          />
          <AppInput
            label="Address"
            value={form.address}
            onChangeText={value => updateField('address', value)}
            placeholder="Street, village or area"
            leftElement={
              <MaterialIcons name="place" size={20} color="#648074" />
            }
            error={error && !form.address ? error : null}
          />
          <AppInput
            label="District"
            value={form.district}
            onChangeText={value => updateField('district', value)}
            placeholder="District"
            error={error && !form.district ? error : null}
          />
          <AppInput
            label="Province"
            value={form.province}
            onChangeText={value => updateField('province', value)}
            placeholder="Province"
            error={error && !form.province ? error : null}
          />
          <AppInput
            label="Country"
            value={form.country}
            onChangeText={value => updateField('country', value)}
            placeholder="Country"
            error={error && !form.country ? error : null}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton
            title="Save & Continue"
            onPress={handleSave}
            loading={loading}
            style={styles.primaryButton}
          />
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
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 26,
  },
  stepHeader: {
    marginBottom: 20,
  },
  eyebrow: {
    color: '#4E8068',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 9,
  },
  stepTrack: {
    height: 5,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#DBE8DD',
  },
  stepProgress: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#176B4B',
  },
  title: {
    color: '#183D2F',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 5,
  },
  subtitle: {
    color: '#62776B',
    fontSize: 15,
    marginBottom: 20,
  },
  error: {
    color: '#B74743',
    fontSize: 13,
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 56,
    marginTop: 2,
  },
});
