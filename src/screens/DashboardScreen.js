import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import AppButton from '../components/AppButton';
import {getSession} from '../services/authService';
import {getFarmsForUser} from '../services/farmService';
import {fetchSheepByFarm} from '../services/sheepService';
import FarmCard from '../components/FarmCard';

export default function DashboardScreen({navigation}) {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sheepCounts, setSheepCounts] = useState({});
  const [accessMode, setAccessMode] = useState('standard');
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadFarms = async () => {
        setLoading(true);
        setError('');
        try {
          const session = await getSession();
          if (!session?.user_id) {
            throw new Error(
              'Your session is no longer active. Please log in again.',
            );
          }

          const userFarms = await getFarmsForUser(session.user_id);
          const countEntries = await Promise.all(
            userFarms.map(async farm => {
              try {
                const sheep = await fetchSheepByFarm(farm.farm_id);
                return [farm.farm_id, sheep.length];
              } catch (countError) {
                console.warn('Unable to load farm sheep count', countError);
                return [farm.farm_id, null];
              }
            }),
          );

          if (isActive) {
            setFarms(userFarms);
            setSheepCounts(Object.fromEntries(countEntries));
          }
        } catch (loadError) {
          console.warn('Unable to load dashboard state', loadError);
          if (isActive) {
            setError(loadError?.message || 'Unable to load your farms.');
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadFarms();
      return () => {
        isActive = false;
      };
      // Changing reloadKey re-runs the fetch while this tab is focused.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadKey]),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#176B4B" />
          <Text style={styles.loading}>Loading your farms...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.title}>Your farms could not be loaded</Text>
          <Text style={styles.heroText}>{error}</Text>
          <AppButton
            title="Try Again"
            onPress={() => setReloadKey(key => key + 1)}
          />
        </View>
      ) : farms.length > 0 ? (
        <>
          <Text style={styles.eyebrow}>SHEEPVISION</Text>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Manage your farms from one place.</Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Farms</Text>
            <Text style={styles.farmCount}>{farms.length}</Text>
          </View>

          {farms.map(farm => (
            <FarmCard
              key={farm.farm_id}
              farm={farm}
              sheepCount={sheepCounts[farm.farm_id]}
              onPress={() => navigation.navigate('FarmDashboard', {farm})}
            />
          ))}

          <AppButton
            title="+ Add Another Farm"
            onPress={() => navigation.navigate('AddFarm')}
            variant="secondary"
            textStyle={styles.secondaryButtonText}
            style={styles.addFarmButton}
          />
        </>
      ) : accessMode === 'limited' ? (
        <View style={styles.limitedState}>
          <Text style={styles.eyebrow}>LIMITED ACCESS</Text>
          <Text style={styles.title}>You can explore SheepVision</Text>
          <Text style={styles.heroText}>
            Add a farm whenever you are ready to manage your flock and farm
            activities.
          </Text>
          <AppButton
            title="+ Create Farm"
            onPress={() => navigation.navigate('AddFarm')}
          />
        </View>
      ) : (
        <>
          <Text style={styles.eyebrow}>WELCOME</Text>
          <Text style={styles.title}>Welcome to SheepVision</Text>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Farm management starts here.</Text>
            <Text style={styles.heroText}>
              Create your first farm to start managing your sheep, records and
              farm activities.
            </Text>
            <AppButton
              title="+ Create Farm"
              onPress={() => navigation.navigate('AddFarm')}
            />
            <AppButton
              title="Skip for Now"
              onPress={() => setAccessMode('limited')}
              variant="secondary"
              textStyle={styles.secondaryButtonText}
              style={styles.secondaryButton}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 30,
  },
  eyebrow: {
    color: '#0F8A5F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F2E24',
    marginBottom: 6,
  },
  subtitle: {
    color: '#587268',
    fontSize: 15,
    marginBottom: 26,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    marginTop: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#102821',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    color: '#587268',
    marginBottom: 16,
    lineHeight: 22,
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#EAF8F1',
  },
  secondaryButtonText: {
    color: '#0F8A5F',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#112922',
    flex: 1,
  },
  farmCount: {
    color: '#507166',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#E8F7F0',
    overflow: 'hidden',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  loading: {
    color: '#4F635F',
    marginTop: 12,
  },
  stateContainer: {
    flex: 1,
    minHeight: 300,
    justifyContent: 'center',
  },
  limitedState: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    marginTop: 12,
  },
  addFarmButton: {
    marginTop: 8,
    marginBottom: 12,
  },
});
