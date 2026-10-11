import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {getSheepTagNumber} from '../utils/qr';

export default function SheepCard({sheep, onPress}) {
  const imageSource = sheep?.image_url
    ? {uri: sheep.image_url}
    : {
        uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=300&q=80',
      };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.tag}>{getSheepTagNumber(sheep) || 'Sheep'}</Text>
        <Text style={styles.breed}>{sheep?.breed || 'Merino'}</Text>
        <Text style={styles.meta}>
          {sheep?.gender || 'Female'} • {sheep?.flock_name || 'Flock'}{' '}
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Registered</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDEFE4',
    marginBottom: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  tag: {
    fontSize: 16,
    fontWeight: '700',
    color: '#122920',
  },
  breed: {
    color: '#49655C',
    fontSize: 14,
    marginTop: 4,
  },
  meta: {
    color: '#68857C',
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF8F1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B7A55',
  },
});
