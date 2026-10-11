import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import SheepCard from '../components/SheepCard';
import {getSession} from '../services/authService';
import {supabase} from '../config/supabase';
import {getSheepTagNumber} from '../utils/qr';

export default function SheepListScreen({navigation}) {
  const [sheep, setSheep] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSheep = async () => {
      try {
        const session = await getSession();
        if (!session?.user_id) return;
        const farmList = await supabase
          .from('farms')
          .select('farm_id')
          .eq('owner_id', session.user_id);
        const farmIds = (farmList?.data || []).map(item => item.farm_id);
        if (!farmIds.length) {
          setSheep([]);
          return;
        }

        const {data: sheepData, error} = await supabase
          .from('sheep')
          .select('*')
          .in('farm_id', farmIds);
        if (error) throw error;
        setSheep(sheepData || []);
      } catch (err) {
        console.warn('Unable to load sheep list', err);
      } finally {
        setLoading(false);
      }
    };

    loadSheep();
  }, []);

  const filteredSheep = useMemo(() => {
    return sheep.filter(item => {
      const matchesQuery = [
        getSheepTagNumber(item),
        item.sheep_id,
        item.breed,
        item.qr_code,
      ].some(value =>
        String(value || '')
          .toLowerCase()
          .includes(query.toLowerCase()),
      );
      const matchesFilter = filter === 'All' || item.gender === filter;
      return matchesQuery && matchesFilter;
    });
  }, [sheep, query, filter]);

  const renderItem = ({item}) => (
    <SheepCard
      sheep={item}
      onPress={() =>
        navigation.navigate('SheepDetails', {sheepId: item.sheep_id})
      }
    />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Sheep</Text>
        <AppButton
          title="+ Add Sheep"
          onPress={() => navigation.navigate('AddSheep')}
          style={styles.addBtn}
        />
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by tag, name or QR..."
        style={styles.search}
      />

      <View style={styles.filters}>
        {['All', 'Male', 'Female'].map(option => (
          <Text
            key={option}
            onPress={() => setFilter(option)}
            style={[styles.filter, filter === option && styles.filterActive]}>
            {option}
          </Text>
        ))}
      </View>

      {loading ? <Text style={styles.loading}>Loading sheep...</Text> : null}

      {!loading && filteredSheep.length === 0 ? (
        <EmptyState
          title="No sheep found"
          message="Add a sheep to start tracking your flock."
          action={
            <AppButton
              title="Add Sheep"
              onPress={() => navigation.navigate('AddSheep')}
            />
          }
        />
      ) : null}

      {!loading && filteredSheep.length > 0 ? (
        <FlatList
          data={filteredSheep}
          keyExtractor={item => String(item.sheep_id)}
          renderItem={renderItem}
          contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 30}}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  title: {fontSize: 30, fontWeight: '800', color: '#0F2E24'},
  addBtn: {width: 140},
  search: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDEEE4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#112821',
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 18,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EAF8F1',
    color: '#0B7A55',
    fontWeight: '700',
  },
  filterActive: {
    backgroundColor: '#0F8A5F',
    color: '#fff',
  },
  loading: {
    color: '#4F635F',
    marginHorizontal: 20,
    marginTop: 10,
  },
});
