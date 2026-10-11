import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import AppButton from '../components/AppButton';
import {fetchUserProfile, getSession, signOut} from '../services/authService';

export default function ProfileScreen({navigation}) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const session = await getSession();
        if (!session?.user_id) return;

        const user = await fetchUserProfile(session.user_id);
        if (user) {
          setProfile({
            name: user.name || 'SheepVision User',
            email: user.email || '',
            phone: user.phone || '',
          });
        }
      } catch (error) {
        console.warn('Unable to load profile', error);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.warn('Unable to sign out', error);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{profile?.name || 'SheepVision User'}</Text>
        <Text style={styles.meta}>{profile?.email || 'Email unavailable'}</Text>
        <Text style={styles.meta}>{profile?.phone || 'Phone unavailable'}</Text>
      </View>

      <View style={styles.list}>
        <MenuItem label="My Farms" />
        <MenuItem label="Change Password" />
        <MenuItem label="Language" />
        <MenuItem label="Help & Support" />
        <MenuItem label="About App" />
      </View>

      <AppButton
        title="Logout"
        onPress={handleLogout}
        variant="secondary"
        textStyle={{color: '#0F8A5F'}}
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

function MenuItem({label}) {
  return (
    <View style={styles.menuRow}>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.arrow}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  content: {padding: 22, paddingTop: 48, paddingBottom: 30},
  title: {fontSize: 30, fontWeight: '800', color: '#0F2E24', marginBottom: 18},
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E1F0E7',
    marginBottom: 20,
  },
  name: {fontSize: 24, fontWeight: '800', color: '#102821', marginBottom: 8},
  meta: {color: '#536861', fontSize: 15, marginBottom: 4},
  list: {gap: 12},
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E1F0E7',
  },
  menuText: {fontSize: 15, fontWeight: '600', color: '#102821'},
  arrow: {fontSize: 24, color: '#0F8A5F'},
  logoutButton: {marginTop: 24, backgroundColor: '#EAF8F1'},
});
