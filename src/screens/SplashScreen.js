import React, {useEffect} from 'react';
import {ImageBackground, StatusBar, StyleSheet, View} from 'react-native';
import * as SplashScreenModule from 'expo-splash-screen';

export default function SplashScreen() {
  useEffect(() => {
    SplashScreenModule.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={require('../../assets/sheepvision-splash.png')}
        resizeMode="cover"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071B16',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
});
