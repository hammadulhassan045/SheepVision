import React, {useEffect, useState} from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import SheepQRCode from '../components/SheepQRCode';
import {fetchSheepById} from '../services/sheepService';
import {getSheepTagNumber} from '../utils/qr';

export default function SheepDetailsScreen({navigation, route}) {
  const sheepId = route?.params?.sheepId;
  const [sheep, setSheep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    const loadSheep = async () => {
      if (!sheepId) {
        return;
      }
      try {
        const data = await fetchSheepById(sheepId);
        setSheep(data);
      } catch (error) {
        console.warn('Unable to load sheep details', error);
      } finally {
        setLoading(false);
      }
    };

    loadSheep();
  }, [sheepId]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading sheep details...</Text>
      </View>
    );
  }

  if (!sheep) {
    return (
      <View style={styles.loading}>
        <Text style={styles.notFound}>Sheep record not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {sheep.image_url ? (
        <Image source={{uri: sheep.image_url}} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="pets" size={42} color="#6A8A78" />
          <Text style={styles.imagePlaceholderText}>No sheep image</Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.tag}>{getSheepTagNumber(sheep) || 'Sheep'}</Text>
        <Text style={styles.status}>Registered</Text>
      </View>

      <Text style={styles.sectionTitle}>Information</Text>
      <View style={styles.infoGrid}>
        <InfoItem label="Gender" value={sheep.gender || 'Not recorded'} />
        <InfoItem label="Breed" value={sheep.breed || 'Not recorded'} />
        <InfoItem label="DOB" value={sheep.dob || 'Not recorded'} />
        <InfoItem
          label="Flock"
          value={sheep.flock_id ? 'Assigned' : 'Not assigned'}
        />
        <InfoItem label="Source" value={sheep.source || 'Not recorded'} />
        <InfoItem
          label="Mother"
          value={sheep.mother_id ? 'Recorded' : 'Not recorded'}
        />
        <InfoItem
          label="Father"
          value={sheep.father_id ? 'Recorded' : 'Not recorded'}
        />
      </View>

      <Text style={styles.sectionTitle}>Notes</Text>
      <Text style={styles.notes}>{sheep.notes || 'No notes recorded.'}</Text>

      <AppButton
        title="View QR Code"
        onPress={() => setQrVisible(true)}
        style={styles.button}
      />
      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}>
        <View style={styles.qrModalBackdrop}>
          <View style={styles.qrModalCard}>
            <Text style={styles.qrModalTitle}>SheepVision QR Code</Text>
            <Text style={styles.qrModalTag}>
              {getSheepTagNumber(sheep) || 'Sheep'}
            </Text>
            <SheepQRCode
              value={sheep.qr_code || sheep.sheep_id}
              size={220}
            />
            <Text style={styles.qrModalHint}>
              Scan to identify this sheep in SheepVision.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setQrVisible(false)}
              style={styles.qrModalClose}>
              <Text style={styles.qrModalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InfoItem({label, value}) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  content: {padding: 22, paddingBottom: 40},
  image: {width: '100%', height: 240, borderRadius: 24, marginBottom: 16},
  imagePlaceholder: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3EEE5',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#547161',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tag: {fontSize: 28, fontWeight: '800', color: '#0F2E24'},
  status: {
    backgroundColor: '#EAF8F1',
    color: '#0B7A55',
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2E24',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5F0E9',
  },
  label: {color: '#5F6F6A', fontSize: 12, marginBottom: 6},
  value: {color: '#102821', fontSize: 15, fontWeight: '700'},
  notes: {color: '#48635D', fontSize: 15, lineHeight: 24, marginBottom: 20},
  button: {marginTop: 8},
  qrModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  qrModalCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  qrModalTitle: {
    color: '#0F2E24',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  qrModalTag: {
    color: '#567069',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  qrModalHint: {
    color: '#536861',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  qrModalClose: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EAF8F1',
  },
  qrModalCloseText: {color: '#0F8A5F', fontWeight: '700'},
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FBF7',
  },
  notFound: {color: '#D64545', fontSize: 16, fontWeight: '700'},
});
