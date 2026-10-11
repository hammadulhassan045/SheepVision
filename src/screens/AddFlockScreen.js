import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import {createFlock} from '../services/flockService';

export default function AddFlockScreen({navigation, route}) {
  const farmId = route?.params?.farmId;
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Flock name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createFlock({farmId, name, purpose});
      navigation.goBack();
    } catch (err) {
      setError(err?.message || 'Unable to save flock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add Flock</Text>
        <Text style={styles.subtitle}>Create a new flock for your farm</Text>

        <AppInput
          label="Flock Name"
          value={name}
          onChangeText={setName}
          placeholder="Main Flock"
          error={error && !name ? error : null}
        />
        <AppInput
          label="Purpose"
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Breeding, wool, etc."
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Save Flock" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  content: {flexGrow: 1, padding: 22, paddingTop: 48},
  title: {fontSize: 30, fontWeight: '800', color: '#0F2E24', marginBottom: 8},
  subtitle: {fontSize: 15, color: '#536861', marginBottom: 20},
  error: {color: '#D64545', fontSize: 13, marginBottom: 12},
});
