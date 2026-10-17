import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

import {getFarmUsers} from '../services/farmService';
import {getFlocksByFarm} from '../services/flockService';
import {fetchSheepByFarm} from '../services/sheepService';

const GREEN = '#176B4B';
const DARK = '#183B2C';
const MUTED = '#718078';

const NAV_ITEMS = [
  {label: 'Home', icon: 'home', route: 'Dashboard'},
  {label: 'Sheep', icon: 'pets', route: 'Sheep'},
  {label: 'Scan', icon: 'qr-code-scanner', route: 'Scan'},
  {label: 'Records', icon: 'assignment', route: 'Records'},
  {label: 'Profile', icon: 'person-outline', route: 'Profile'},
];

export default function FarmDashboardScreen({navigation, route}) {
  const farm = route?.params?.farm || route?.params?.selectedFarm || null;

  const [sheep, setSheep] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [managementOpen, setManagementOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!farm?.farm_id) {
      setSheep([]);
      setFlocks([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [sheepData, flockData, memberData] = await Promise.all([
        fetchSheepByFarm(farm.farm_id),
        getFlocksByFarm(farm.farm_id),
        getFarmUsers(farm.farm_id),
      ]);

      setSheep(Array.isArray(sheepData) ? sheepData : []);
      setFlocks(Array.isArray(flockData) ? flockData : []);
      setMembers(Array.isArray(memberData) ? memberData : []);
    } catch (e) {
      setError(e?.message || 'Unable to load farm information.');
    } finally {
      setLoading(false);
    }
  }, [farm?.farm_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openManagement = () => setManagementOpen(true);

  const openAddSheep = () => {
    setManagementOpen(false);

    navigation.navigate('AddSheep', {
      farm,
      flockId: flocks[0]?.flock_id || '',
    });
  };

  const openSheepList = action => {
    setManagementOpen(false);

    navigation.navigate('Sheep', {
      farm,
      managementAction: action,
    });
  };

  const goTo = screen => navigation.navigate(screen);

  const stats = [
    {label: 'Total Sheep', value: sheep.length, icon: 'pets'},
    {label: 'Flocks', value: flocks.length, icon: 'groups'},
    {label: 'Farm Members', value: members.length, icon: 'people-outline'},
  ];

  const renderManagement = () => (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F2" />

      <View style={styles.managementHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setManagementOpen(false)}>
          <MaterialIcons name="arrow-back" size={23} color={DARK} />
        </TouchableOpacity>

        <View style={{flex: 1, marginLeft: 13}}>
          <Text style={styles.managementTitle}>Sheep Management</Text>
          <Text style={styles.muted}>Manage your registered sheep</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.managementContent}>
        <View style={styles.managementBanner}>
          <MaterialIcons name="pets" size={34} color="#FFFFFF" />
          <View style={{flex: 1, marginLeft: 14}}>
            <Text style={styles.bannerTitle}>Your Sheep Records</Text>
            <Text style={styles.bannerSubtitle}>
              {loading ? 'Loading...' : `${sheep.length} sheep registered`}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose an action</Text>

        <ManagementAction
          icon="add-circle-outline"
          title="Add Sheep"
          description="Register a new sheep and generate its tag."
          color={GREEN}
          onPress={openAddSheep}
        />

        <ManagementAction
          icon="remove-circle-outline"
          title="Remove Sheep"
          description="Manage a sheep's membership in a flock."
          color="#B7791F"
          onPress={() => openSheepList('remove')}
        />

        <ManagementAction
          icon="delete-outline"
          title="Delete Sheep"
          description="Open sheep records to manage deletion."
          color="#C0392B"
          onPress={() => {
            Alert.alert('Delete Sheep', 'Select a sheep record to continue.', [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'View Sheep',
                onPress: () => openSheepList('delete'),
              },
            ]);
          }}
        />

        <View style={styles.note}>
          <MaterialIcons name="info-outline" size={19} color={GREEN} />
          <Text style={styles.noteText}>
            Removing a sheep from a flock and permanently deleting its record
            are different actions.
          </Text>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} active="Sheep" />
    </View>
  );

  if (managementOpen) {
    return renderManagement();
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      <ScrollView
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.brandIcon}>
              <MaterialIcons name="grass" size={25} color="#FFFFFF" />
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
              <MaterialIcons name="refresh" size={21} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.eyebrow}>SHEEPVISION</Text>
          <Text style={styles.farmName}>
            {farm?.farm_name || 'Welcome to your farm'}
          </Text>
          <Text style={styles.heroSubtitle}>Manage your sheep, your way.</Text>
        </View>

        <View style={styles.stats}>
          {stats.map(item => (
            <View style={styles.statCard} key={item.label}>
              <MaterialIcons name={item.icon} size={23} color={GREEN} />
              <Text style={styles.statValue}>{loading ? '—' : item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.managementButton}
          onPress={openManagement}>
          <View style={styles.managementButtonIcon}>
            <MaterialIcons name="pets" size={29} color={GREEN} />
          </View>

          <View style={{flex: 1}}>
            <Text style={styles.managementButtonTitle}>Sheep Management</Text>
            <Text style={styles.managementButtonSubtitle}>
              Add, remove and manage sheep records
            </Text>
          </View>

          <MaterialIcons name="chevron-right" size={26} color={GREEN} />
        </TouchableOpacity>

        <View style={styles.actionsGrid}>
          <SmallAction
            icon="groups"
            title="Manage Flocks"
            onPress={() =>
              navigation.navigate('AddFlock', {
                farmId: farm?.farm_id,
                farm,
              })
            }
          />
          <SmallAction
            icon="people-outline"
            title="Farm Members"
            onPress={() =>
              navigation.navigate('FarmUsers', {
                farmId: farm?.farm_id,
                farm,
              })
            }
          />
          <SmallAction
            icon="account-balance-wallet"
            title="Finances"
            onPress={() => navigation.navigate('Finance', {farm})}
          />
          <SmallAction
            icon="bar-chart"
            title="Reports"
            onPress={() => navigation.navigate('Reports', {farm})}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Farm Overview</Text>
        </View>

        <View style={styles.overviewCard}>
          {loading ? (
            <ActivityIndicator color={GREEN} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <OverviewRow label="Registered Sheep" value={sheep.length} />
              <OverviewRow label="Available Flocks" value={flocks.length} />
              <OverviewRow label="Farm Members" value={members.length} />
            </>
          )}
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} active="Home" />
    </View>
  );
}

function ManagementAction({icon, title, description, color, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.actionCard}
      onPress={onPress}>
      <View style={[styles.actionIcon, {backgroundColor: `${color}15`}]}>
        <MaterialIcons name={icon} size={27} color={color} />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={23} color={MUTED} />
    </TouchableOpacity>
  );
}

function SmallAction({icon, title, onPress}) {
  return (
    <TouchableOpacity style={styles.smallAction} onPress={onPress}>
      <MaterialIcons name={icon} size={25} color={GREEN} />
      <Text style={styles.smallActionText}>{title}</Text>
    </TouchableOpacity>
  );
}

function OverviewRow({label, value}) {
  return (
    <View style={styles.overviewRow}>
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
    </View>
  );
}

function BottomNavigation({navigation, active}) {
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map(item => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          onPress={() => navigation.navigate(item.route)}>
          <View
            style={[
              styles.navIcon,
              active === item.label && styles.navIconActive,
              item.label === 'Scan' && styles.scanIcon,
            ]}>
            <MaterialIcons
              name={item.icon}
              size={item.label === 'Scan' ? 24 : 22}
              color={
                item.label === 'Scan'
                  ? '#FFFFFF'
                  : active === item.label
                  ? GREEN
                  : '#829087'
              }
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              active === item.label && styles.navLabelActive,
            ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F7F2'},
  dashboardContent: {paddingBottom: 20},
  hero: {
    backgroundColor: DARK,
    padding: 22,
    paddingTop: 17,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#2B6048',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    padding: 10,
    backgroundColor: '#2B6048',
    borderRadius: 13,
  },
  eyebrow: {
    color: '#B7D9C4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  farmName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  heroSubtitle: {color: '#D0E8D9', fontSize: 13, marginTop: 5},
  heroCount: {
    marginTop: 24,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: '#355846',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCountLabel: {color: '#B7D9C4', fontSize: 10, fontWeight: '700'},
  heroCountValue: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 5,
  },
  stats: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 17,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  statValue: {fontSize: 22, fontWeight: '800', color: DARK, marginTop: 8},
  statLabel: {fontSize: 10, color: MUTED, marginTop: 4},
  sectionHeader: {marginHorizontal: 18, marginTop: 24, marginBottom: 12},
  sectionTitle: {fontSize: 17, fontWeight: '800', color: DARK},
  managementButton: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E8DC',
  },
  managementButtonIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: '#E8F4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  managementButtonTitle: {fontSize: 15, fontWeight: '800', color: DARK},
  managementButtonSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
    marginTop: 5,
  },
  actionsGrid: {
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  smallAction: {
    width: '48%',
    flexGrow: 1,
    minHeight: 83,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEE8',
    justifyContent: 'center',
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
    marginTop: 8,
  },
  overviewCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },
  overviewLabel: {fontSize: 12, color: MUTED},
  overviewValue: {fontSize: 13, fontWeight: '800', color: DARK},
  errorText: {fontSize: 12, color: '#B93838'},
  managementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 19,
    paddingTop: 16,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  managementTitle: {fontSize: 20, fontWeight: '800', color: DARK},
  muted: {fontSize: 12, color: MUTED, marginTop: 4},
  managementContent: {padding: 17, paddingBottom: 25},
  managementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 19,
    backgroundColor: GREEN,
    marginBottom: 25,
  },
  bannerTitle: {fontSize: 17, fontWeight: '800', color: '#FFFFFF'},
  bannerSubtitle: {fontSize: 12, color: '#E0F0E5', marginTop: 5},
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E7EDE6',
    gap: 12,
  },
  actionIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {fontSize: 14, fontWeight: '800', color: DARK},
  actionDescription: {
    fontSize: 11,
    color: MUTED,
    marginTop: 5,
    lineHeight: 16,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 13,
    backgroundColor: '#E8F4EC',
    borderRadius: 13,
    marginTop: 8,
    gap: 9,
  },
  noteText: {flex: 1, fontSize: 11, color: DARK, lineHeight: 17},
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7ECE7',
    paddingTop: 8,
    paddingBottom: 7,
  },
  navItem: {flex: 1, alignItems: 'center'},
  navIcon: {
    width: 38,
    height: 31,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {backgroundColor: '#E8F4EC'},
  scanIcon: {
    width: 45,
    height: 41,
    marginTop: -15,
    backgroundColor: GREEN,
    borderRadius: 14,
  },
  navLabel: {fontSize: 9, color: '#829087', marginTop: 3},
  navLabelActive: {fontWeight: '800', color: GREEN},
});
