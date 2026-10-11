import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import {getFarmUsers} from '../services/farmService';
import {getFlocksByFarm} from '../services/flockService';
import {fetchSheepByFarm} from '../services/sheepService';

const formatCurrency = value =>
  `₨ ${Number(value || 0).toLocaleString('en-PK')}`;

export default function FarmDashboardScreen({navigation, route}) {
  const farm = route?.params?.farm || route?.params?.selectedFarm || null;
  const [flocks, setFlocks] = useState([]);
  const [sheep, setSheep] = useState([]);
  const [farmUsers, setFarmUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFarmData = async () => {
      if (!farm?.farm_id) {
        setLoading(false);
        return;
      }

      try {
        const [flockData, sheepData, farmUserData] = await Promise.all([
          getFlocksByFarm(farm.farm_id),
          fetchSheepByFarm(farm.farm_id),
          getFarmUsers(farm.farm_id),
        ]);

        setFlocks(flockData || []);
        setSheep(sheepData || []);
        setFarmUsers(farmUserData || []);
      } catch (error) {
        console.warn('Unable to load farm data', error);
      } finally {
        setLoading(false);
      }
    };

    loadFarmData();
  }, [farm]);

  const summaryCards = useMemo(
    () => [
      {value: sheep.length, label: 'Total Sheep', icon: '🐑'},
      {value: flocks.length, label: 'Flocks', icon: '🐏'},
      {value: farmUsers.length, label: 'Farm Users', icon: '👥'},
      {value: formatCurrency(0), label: 'This Month', icon: '₨'},
    ],
    [farmUsers.length, flocks.length, sheep.length],
  );

  const quickActions = useMemo(
    () => [
      {
        title: 'Add Sheep',
        subtitle: 'Register',
        icon: 'add-circle-outline',
        onPress: () =>
          navigation.navigate('AddSheep', {
            farm,
            flockId: flocks[0]?.flock_id,
          }),
      },
      {
        title: 'Remove Sheep',
        subtitle: 'Archive',
        icon: 'delete-outline',
        onPress: () => navigation.navigate('Sheep'),
      },
      {
        title: 'Sheep Records',
        subtitle: 'Track',
        icon: 'assignment',
        onPress: () => navigation.navigate('Records'),
      },
      {
        title: 'Add Flock',
        subtitle: 'Create',
        icon: 'groups',
        onPress: () => navigation.navigate('AddFlock', {farmId: farm?.farm_id}),
      },
      {
        title: 'Farm Users',
        subtitle: 'Access',
        icon: 'people-outline',
        onPress: () => navigation.navigate('FarmUsers', {farmId: farm?.farm_id}),
      },
      {
        title: 'Scan QR',
        subtitle: 'Identify',
        icon: 'qr-code-scanner',
        onPress: () => navigation.navigate('Scan'),
      },
      {
        title: 'Finance',
        subtitle: 'Overview',
        icon: 'account-balance-wallet',
        onPress: () => navigation.navigate('Finance'),
      },
      {
        title: 'Expenses',
        subtitle: 'Costs',
        icon: 'receipt-long',
        onPress: () => navigation.navigate('Finance'),
      },
      {
        title: 'Reports',
        subtitle: 'Summary',
        icon: 'bar-chart',
        onPress: () => navigation.navigate('Reports'),
      },
    ],
    [farm, flocks, navigation],
  );

  const recentActivity = useMemo(() => {
    const items = [];

    if (sheep.length > 0) {
      items.push({
        icon: '🐑',
        title: `${sheep.length} sheep currently registered`,
        detail: 'Today',
      });
    }

    if (flocks.length > 0) {
      items.push({
        icon: '🐏',
        title: `${flocks.length} flock(s) active`,
        detail: 'This week',
      });
    }

    if (farmUsers.length > 0) {
      items.push({
        icon: '👥',
        title: `${farmUsers.length} farm user(s) have access`,
        detail: 'Today',
      });
    }

    if (!items.length) {
      return [
        {
          icon: '📋',
          title: 'No recent farm activity',
          detail: 'Add a flock or register a sheep to get started.',
        },
      ];
    }

    return items.slice(0, 3);
  }, [farmUsers.length, flocks.length, sheep.length]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <Text style={styles.eyebrow}>Farm dashboard</Text>
          <Text style={styles.farmName}>{farm?.farm_name || 'Green Valley Farm'}</Text>
          <Text style={styles.locationText}>
            {farm?.district || 'Khushab'} / {farm?.province || 'Punjab'}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate('More')}
          style={styles.settingsButton}>
          <MaterialIcons name="settings" size={22} color="#0F8A5F" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
        {summaryCards.map(card => (
          <View key={card.label} style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>{card.icon}</Text>
            <Text style={styles.summaryValue}>{card.value}</Text>
            <Text style={styles.summaryLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.financePanel}>
        <View style={styles.financeHeaderRow}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <Text style={styles.balanceBadge}>Balance</Text>
        </View>

        <View style={styles.financeColumns}>
          <View style={styles.financeColumn}>
            <Text style={styles.financeLabel}>Income</Text>
            <Text style={styles.financeValue}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.financeColumn}>
            <Text style={styles.financeLabel}>Expenses</Text>
            <Text style={styles.financeValue}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.financeColumnAccent}>
            <Text style={styles.financeLabel}>Net</Text>
            <Text style={styles.financeValue}>{formatCurrency(0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActionsGrid}>
        {quickActions.map(action => (
          <TouchableOpacity
            key={action.title}
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={action.onPress}
            style={styles.quickAction}>
            <View style={styles.actionIconWrap}>
              <MaterialIcons name={action.icon} size={22} color="#176B4B" />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.activityCard}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {recentActivity.map(item => (
          <View key={`${item.title}-${item.detail}`} style={styles.activityItem}>
            <Text style={styles.activityIcon}>{item.icon}</Text>
            <View style={styles.activityCopy}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading farm summary...</Text>
      ) : null}

      {!loading && sheep.length === 0 && flocks.length === 0 ? (
        <EmptyState
          title="No activity yet"
          message="Add a flock and register the first sheep to get a full farm view."
          action={
            <AppButton
              title="Add Flock"
              onPress={() => navigation.navigate('AddFlock', {farmId: farm?.farm_id})}
            />
          }
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 26,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerInfo: {
    flex: 1,
  },
  eyebrow: {
    color: '#0F8A5F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  farmName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2E24',
  },
  locationText: {
    color: '#587268',
    fontSize: 13,
    marginTop: 4,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF8F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    padding: 12,
    marginBottom: 10,
  },
  summaryIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2E24',
  },
  summaryLabel: {
    color: '#4F635F',
    fontSize: 11,
    marginTop: 4,
  },
  financePanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    padding: 14,
    marginBottom: 18,
  },
  financeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#112922',
  },
  balanceBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F8A5F',
    textTransform: 'uppercase',
  },
  financeColumns: {
    flexDirection: 'row',
    gap: 8,
  },
  financeColumn: {
    flex: 1,
    backgroundColor: '#F6FBF8',
    borderRadius: 12,
    padding: 10,
  },
  financeColumnAccent: {
    flex: 1,
    backgroundColor: '#EAF8F1',
    borderRadius: 12,
    padding: 10,
  },
  financeLabel: {
    fontSize: 11,
    color: '#587268',
    marginBottom: 4,
  },
  financeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2E24',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  quickAction: {
    width: '32%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF8F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#112922',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#587268',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.25,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4F2EA',
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF7F1',
  },
  activityIcon: {
    fontSize: 19,
    marginRight: 12,
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#102821',
  },
  activityDetail: {
    fontSize: 11,
    color: '#587268',
    marginTop: 2,
  },
  loadingText: {
    color: '#4F635F',
    marginTop: 12,
  },
});
