import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import {addFarmUser} from '../services/farmService';

export default function FarmUsersScreen({route}) {
  const farmId = route?.params?.farmId;
  const [name, setName] = useState('');
  const [role, setRole] = useState('Manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAddUser = async () => {
    if (!name.trim()) {
      setError('User name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await addFarmUser({farmId, name, role});
      setSubmitted(true);
      setName('');
      setRole('Manager');
    } catch (err) {
      setError(err?.message || 'Unable to add farm user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Farm Users</Text>
      <Text style={styles.subtitle}>
        Add workers or managers associated with the farm
      </Text>

      <AppInput
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter user name"
        error={error && !name ? error : null}
      />
      <AppInput
        label="Role"
        value={role}
        onChangeText={setRole}
        placeholder="Owner, Manager, Staff"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {submitted ? (
        <Text style={styles.success}>User added successfully.</Text>
      ) : null}

      <AppButton title="Save User" onPress={handleAddUser} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  content: {padding: 22, paddingTop: 48},
  title: {fontSize: 30, fontWeight: '800', color: '#0F2E24', marginBottom: 8},
  subtitle: {fontSize: 15, color: '#536861', marginBottom: 18},
  error: {color: '#D64545', fontSize: 13, marginBottom: 12},
  success: {color: '#0F8A5F', fontSize: 13, marginBottom: 12},
});
