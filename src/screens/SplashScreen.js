
import React, {useEffect} from 'react';
import {ImageBackground, StatusBar, StyleSheet, View} from 'react-native';
import * as SplashScreenModule from 'expo-splash-screen';

export default function SplashScreen() {
  useEffect(() => {
    SplashScreenModule.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={require('../../assets/sheepvision-splash.png')}
        resizeMode="cover"
        style={styles.background}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071B16',
  },
  background: {
    flex: 1,
  },
});
