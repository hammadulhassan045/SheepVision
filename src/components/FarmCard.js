import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

export default function FarmCard({farm, sheepCount, onPress}) {
  const location =
    [farm?.address, farm?.district, farm?.province, farm?.country]
      .filter(Boolean)
      .join(', ') || 'Location not provided';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={styles.card}
      onPress={onPress}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="agriculture" size={25} color="#176B4B" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{farm?.farm_name || 'Farm'}</Text>
        <Text style={styles.meta} numberOfLines={2}>
          {location}
        </Text>
        {typeof sheepCount === 'number' ? (
          <Text style={styles.sheepCount}>{sheepCount} Sheep</Text>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={26} color="#6B8178" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDEFE4',
    marginBottom: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E8F7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#112822',
    marginBottom: 4,
  },
  meta: {
    color: '#567069',
    fontSize: 13,
    lineHeight: 18,
  },
  sheepCount: {
    color: '#176B4B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
});
