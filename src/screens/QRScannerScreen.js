import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CameraView, Camera} from 'expo-camera';
import {fetchSheepById} from '../services/sheepService';
import {parseSheepQrValue} from '../utils/qr';

export default function QRScannerScreen({navigation}) {
  const [message, setMessage] = useState('Place the QR code within the frame');
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = async data => {
    if (!data || scanned) return;
    setScanned(true);

    try {
      const sheepId = parseSheepQrValue(data) || data;
      const found = await fetchSheepById(sheepId);
      if (!found) {
        setMessage('Sheep record not found.');
        return;
      }
      navigation.navigate('SheepDetails', {sheepId: found.sheep_id});
    } catch (error) {
      setMessage('Sheep record not found.');
    }
  };

  if (hasPermission === null) {
    return (
      <Text style={styles.permissionText}>Requesting camera permission...</Text>
    );
  }

  if (hasPermission === false) {
    return (
      <Text style={styles.permissionText}>
        Camera access is required to scan QR codes.
      </Text>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Scan QR Code</Text>
      <Text style={styles.instruction}>{message}</Text>

      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{barcodeTypes: ['qr']}}
        onBarcodeScanned={({data}) => handleScan(data)}
      />

      <Text style={styles.helper}>
        Make sure the sheep tag is centered inside the camera frame.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7', paddingTop: 48},
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F2E24',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {textAlign: 'center', color: '#536861', marginBottom: 16},
  camera: {
    height: 420,
    width: '90%',
    borderRadius: 32,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  container: {flex: 1},
  scanText: {fontSize: 16, color: '#0F2E24', fontWeight: '700'},
  helper: {fontSize: 13, color: '#567069', textAlign: 'center'},
});
