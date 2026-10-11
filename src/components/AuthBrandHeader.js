import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

export default function AuthBrandHeader({navigation, showBack = false}) {
  return (
    <View style={styles.row}>
      <View style={styles.brandLockup}>
        <View style={styles.mark}>
          <MaterialIcons name="pets" size={22} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.brand}>SheepVision</Text>
          <Text style={styles.identity}>SMART SHEEP FARMING</Text>
        </View>
      </View>
      {showBack ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color="#183D2F" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#176B4B',
  },
  brand: {
    color: '#163A2D',
    fontSize: 18,
    fontWeight: '800',
  },
  identity: {
    color: '#648074',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#E6F1E9',
  },
});
