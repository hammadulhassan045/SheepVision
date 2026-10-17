import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';

import AuthBrandHeader from '../components/AuthBrandHeader';
import AppButton from '../components/AppButton';
import {getSession} from '../services/authService';
import {getFarmsForUser} from '../services/farmService';
import {fetchSheepByFarm} from '../services/sheepService';

const C = {
  green: '#176B4B',
  dark: '#183B2C',
  muted: '#7A897E',
  bg: '#F4F7F2',
  pale: '#E8F2E7',
  white: '#FFFFFF',
  border: '#E3EAE1',
};

export default function DashboardScreen({navigation}) {
  const [farms, setFarms] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limited, setLimited] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);
        setError('');

        try {
          const user = await getSession();
          if (!user?.user_id) throw new Error('Please log in again.');

          const data = await getFarmsForUser(user.user_id);
          const results = await Promise.all(
            data.map(async farm => {
              try {
                return [
                  farm.farm_id,
                  (await fetchSheepByFarm(farm.farm_id)).length,
                ];
              } catch {
                return [farm.farm_id, null];
              }
            }),
          );

          if (active) {
            setFarms(data);
            setCounts(Object.fromEntries(results));
          }
        } catch (e) {
          if (active) setError(e.message || 'Unable to load farms.');
        } finally {
          if (active) setLoading(false);
        }
      }

      load();
      return () => {
        active = false;
      };
    }, [reload]),
  );

  const openFarm = farm => navigation.navigate('FarmDashboard', {farm});
  const addFarm = () => navigation.navigate('AddFarm');

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>
      <AuthBrandHeader navigation={navigation} />

      <View style={s.hero}>
        <Text style={s.eyebrow}>YOUR WORKSPACE</Text>
        <Text style={s.title}>Welcome to your farm.</Text>
        <Text style={s.subtitle}>
          Select a farm to manage your sheep, health records and daily activity.
        </Text>

        <View style={s.heroImage}>
          <Image
            source={require('../../assets/Farm.png')}
            style={s.image}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={s.sectionHeader}>
        <View>
          <Text style={s.sectionTitle}>Your farms</Text>
          <Text style={s.sectionSub}>Choose where to get started</Text>
        </View>

        {!!farms.length && (
          <View style={s.countBadge}>
            <Text style={s.countBadgeText}>{farms.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={s.state}>
          <ActivityIndicator size="large" color={C.green} />
          <Text style={s.muted}>Loading your farms...</Text>
        </View>
      ) : error ? (
        <View style={s.card}>
          <MaterialCommunityIcons
            name="cloud-alert"
            size={32}
            color="#B74743"
          />
          <Text style={s.farmTitle}>Couldn't load farms</Text>
          <Text style={s.muted}>{error}</Text>
          <AppButton title="Try Again" onPress={() => setReload(v => v + 1)} />
        </View>
      ) : farms.length ? (
        <>
          {farms.map(farm => (
            <TouchableOpacity
              key={farm.farm_id}
              style={s.farmCard}
              activeOpacity={0.8}
              onPress={() => openFarm(farm)}>
              <View style={s.farmIcon}>
                <MaterialCommunityIcons name="barn" size={30} color={C.green} />
              </View>

              <View style={{flex: 1}}>
                <Text style={s.farmTitle} numberOfLines={1}>
                  {farm.farm_name || farm.name || farm.farmName || 'My Farm'}
                </Text>

                <Text style={s.muted} numberOfLines={1}>
                  {farm.location || farm.address || 'Your farm space'}
                </Text>

                <View style={s.sheepRow}>
                  <MaterialCommunityIcons
                    name="sheep"
                    size={16}
                    color={C.green}
                  />
                  <Text style={s.sheepText}>
                    {counts[farm.farm_id] == null
                      ? 'Sheep count unavailable'
                      : `${counts[farm.farm_id]} sheep`}
                  </Text>
                </View>
              </View>

              <MaterialIcons
                name="arrow-forward-ios"
                size={17}
                color={C.green}
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={s.addCard}
            onPress={addFarm}
            activeOpacity={0.8}>
            <MaterialIcons
              name="add-circle-outline"
              size={25}
              color={C.green}
            />
            <Text style={s.addText}>Add another farm</Text>
            <MaterialIcons name="chevron-right" size={24} color={C.green} />
          </TouchableOpacity>
        </>
      ) : (
        <View style={s.emptyCard}>
          <View style={s.emptyIcon}>
            <MaterialCommunityIcons name="barn" size={48} color={C.green} />
          </View>

          <Text style={s.emptyTitle}>
            {limited ? 'Your workspace is ready' : 'Start with your first farm'}
          </Text>

          <Text style={s.emptyText}>
            Create a farm to organize your flock and keep all your records in
            one place.
          </Text>

          <AppButton title="Create Your First Farm" onPress={addFarm} />

          {!limited && (
            <TouchableOpacity style={s.skip} onPress={() => setLimited(true)}>
              <Text style={s.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={s.footer}>BETTER RECORDS. HEALTHIER FLOCKS.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: C.bg},
  content: {padding: 20, paddingBottom: 35},

  hero: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 24,
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: C.green,
  },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    color: C.dark,
    marginTop: 9,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: C.muted,
    marginTop: 8,
  },
  heroImage: {
    height: 155,
    marginTop: 17,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: C.pale,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {fontSize: 19, fontWeight: '800', color: C.dark},
  sectionSub: {fontSize: 12, color: C.muted, marginTop: 4},
  countBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: C.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {fontWeight: '800', color: C.green},

  farmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 15,
    marginBottom: 12,
    backgroundColor: C.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
  },
  farmIcon: {
    width: 58,
    height: 62,
    borderRadius: 15,
    backgroundColor: C.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 5,
  },
  muted: {fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 4},
  sheepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  sheepText: {fontSize: 12, fontWeight: '700', color: C.green},

  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 15,
    marginTop: 4,
    borderRadius: 17,
    backgroundColor: C.pale,
  },
  addText: {flex: 1, fontSize: 13, fontWeight: '700', color: C.dark},

  state: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    padding: 22,
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 23,
    backgroundColor: C.white,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 95,
    height: 95,
    borderRadius: 29,
    backgroundColor: C.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.dark,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: C.muted,
    textAlign: 'center',
    marginVertical: 12,
  },
  skip: {padding: 13},
  skipText: {fontSize: 13, fontWeight: '700', color: C.green},
  footer: {
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#94A197',
    marginTop: 28,
  },
});
