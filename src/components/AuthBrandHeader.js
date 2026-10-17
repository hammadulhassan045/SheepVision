import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';

export default function AuthBrandHeader({navigation, showBack = false}) {
  return (
    <View style={styles.container}>
      <View style={styles.brandLockup}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="sheep" size={29} color="#FFFFFF" />
        </View>

        <View style={styles.brandText}>
          <Text style={styles.brandName}>SheepVision</Text>
          <Text style={styles.tagline}>SMART SHEEP FARMING</Text>
        </View>
      </View>

      {showBack && navigation ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={21} color="#174B36" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#176B4B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#176B4B',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 3,
  },
  brandText: {
    justifyContent: 'center',
  },
  brandName: {
    color: '#173D2D',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#648170',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E7F1E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
