import React, {useEffect, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import {getSession} from '../services/authService';
import {
  createSheepRecord,
  createSheepPurchaseExpense,
  fetchSheepRegistrationData,
  getNextSheepTagNumber,
} from '../services/sheepService';
import {getSheepTagNumber} from '../utils/qr';
import {validateSheepForm} from '../utils/validation';

const GREEN = '#176B4B';
const DARK = '#183B2C';

const BREEDS = [
  'Kajli',
  'Lohi',
  'Thalli',
  'Cholistani',
  'Sipli',
  'Balkhi',
  'Damani',
  'Buchi',
  'Khijloo',
  'Kooka',
  'Other',
];

const SOURCES = ['Farm Breeding', 'Purchase'];
const GENDERS = ['Female', 'Male'];

const formatDate = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

export default function AddSheepScreen({navigation, route}) {
  const farm = route?.params?.farm || null;
  const presetFlockId = route?.params?.flockId || '';

  const [sheep, setSheep] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [image, setImage] = useState(null);
  const [picker, setPicker] = useState(null);
  const [dateVisible, setDateVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    tagNumber: '',
    breed: '',
    gender: 'Female',
    dob: '',
    flockId: presetFlockId,
    source: '',
    motherId: '',
    fatherId: '',
    purchaseCost: '',
    notes: '',
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        if (!farm?.farm_id) {
          throw new Error('Please select a farm first.');
        }

        const session = await getSession();

        if (!session?.accessToken) {
          throw new Error('Please sign in again.');
        }

        const data = await fetchSheepRegistrationData(
          farm.farm_id,
          session.accessToken,
        );

        if (!active) return;

        setSheep(data?.sheep || []);
        setFlocks(data?.flocks || []);

        setForm(prev => ({
          ...prev,
          tagNumber: data?.tagNumber || '',
          flockId:
            prev.flockId || presetFlockId || data?.flocks?.[0]?.flock_id || '',
        }));
      } catch (e) {
        if (active) setError(e?.message || 'Unable to load farm data.');
      } finally {
        if (active) setLoadingData(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [farm?.farm_id, presetFlockId]);

  const update = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
    setError('');
  };

  const mothers = sheep.filter(s => s.gender?.toLowerCase() === 'female');
  const fathers = sheep.filter(s => s.gender?.toLowerCase() === 'male');

  const chooseImage = async source => {
    try {
      setError('');

      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError('Please allow access to the camera or photo gallery.');
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });

      if (!result.canceled && result.assets?.[0]) {
        setImage(result.assets[0]);
      }
    } catch (e) {
      setError(e?.message || 'Unable to select photo.');
    }
  };

  const openDatePicker = () => {
    const value = form.dob ? new Date(`${form.dob}T00:00:00`) : new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (event, date) => {
          if (event.type === 'set' && date) update('dob', formatDate(date));
        },
      });
    } else {
      setDateVisible(true);
    }
  };

  const saveSheep = async () => {
    if (loading || loadingData) return;

    const flockId = form.flockId || presetFlockId;

    const validationError = validateSheepForm({...form, flockId});

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!farm?.farm_id) {
      setError('Please select a farm first.');
      return;
    }

    if (
      form.source === 'Purchase' &&
      (!form.purchaseCost || !Number.isFinite(Number(form.purchaseCost)))
    ) {
      setError('Please enter a valid purchase cost.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const session = await getSession();

      if (!session?.accessToken) {
        throw new Error('Session expired. Please sign in again.');
      }

      const latestTag = await getNextSheepTagNumber(session.accessToken);

      if (latestTag !== form.tagNumber) {
        setForm(prev => ({...prev, tagNumber: latestTag}));
        setError('Tag number updated. Please press Save Sheep again.');
        return;
      }

      const saved = await createSheepRecord(
        {
          farm_id: farm.farm_id,
          flock_id: flockId,
          tag_number: form.tagNumber,
          breed: form.breed,
          gender: form.gender,
          dob: form.dob || null,
          source: form.source,
          mother_id:
            form.source === 'Farm Breeding' ? form.motherId || null : null,
          father_id:
            form.source === 'Farm Breeding' ? form.fatherId || null : null,
          notes: form.notes.trim(),
        },
        image,
        session.accessToken,
      );

      let purchaseExpenseError = null;

      if (form.source === 'Purchase') {
        try {
          await createSheepPurchaseExpense({
            farmId: farm.farm_id,
            sheepId: saved.sheep_id,
            cost: form.purchaseCost,
            accessToken: session.accessToken,
          });
        } catch (e) {
          purchaseExpenseError = `Sheep saved, but purchase expense failed: ${
            e?.message || 'Unknown error'
          }`;
        }
      }

      navigation.replace('SheepRegistrationSuccess', {
        sheep: saved,
        farm,
        flockId,
        purchaseCost: form.purchaseCost,
        purchaseExpenseError,
      });
    } catch (e) {
      setError(e?.message || 'Unable to register sheep.');
    } finally {
      setLoading(false);
    }
  };

  const selectedMother = sheep.find(s => s.sheep_id === form.motherId);
  const selectedFather = sheep.find(s => s.sheep_id === form.fatherId);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F2" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Add Sheep</Text>
          <Text style={styles.subtitle}>Enter the basic sheep details</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Sheep Photo (Optional)</Text>

          <TouchableOpacity
            style={styles.photo}
            onPress={() => setPicker('image')}>
            {image?.uri ? (
              <Image source={{uri: image.uri}} style={styles.preview} />
            ) : (
              <>
                <Text style={styles.photoIcon}>＋</Text>
                <Text style={styles.photoText}>Add a photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => chooseImage('camera')}>
              <Text style={styles.secondaryText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => chooseImage('gallery')}>
              <Text style={styles.secondaryText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Tag Number</Text>
          <View style={styles.tagBox}>
            <Text style={styles.tagText}>
              {loadingData ? 'Loading...' : form.tagNumber || 'Not available'}
            </Text>
            <Text style={styles.autoText}>AUTO</Text>
          </View>

          <Field
            label="Breed *"
            value={form.breed}
            placeholder="Select breed"
            options={BREEDS}
            onSelect={value => update('breed', value)}
          />

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.row}>
            {GENDERS.map(gender => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.gender,
                  form.gender === gender && styles.genderActive,
                ]}
                onPress={() => update('gender', gender)}>
                <Text
                  style={[
                    styles.genderText,
                    form.gender === gender && styles.genderTextActive,
                  ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field
            label="Flock *"
            value={flocks.find(f => f.flock_id === form.flockId)?.name || ''}
            placeholder={loadingData ? 'Loading flocks...' : 'Select flock'}
            options={flocks.map(f => ({label: f.name, value: f.flock_id}))}
            onSelect={value => update('flockId', value)}
            disabled={!flocks.length || loadingData}
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
            <Text style={form.dob ? styles.value : styles.placeholder}>
              {form.dob || 'Select date of birth'}
            </Text>
            <Text style={styles.dateIcon}>▦</Text>
          </TouchableOpacity>

          {dateVisible && Platform.OS === 'ios' && (
            <View style={styles.datePanel}>
              <DateTimePicker
                value={form.dob ? new Date(`${form.dob}T00:00:00`) : new Date()}
                mode="date"
                maximumDate={new Date()}
                onChange={(_, date) => {
                  if (date) update('dob', formatDate(date));
                }}
              />
              <TouchableOpacity onPress={() => setDateVisible(false)}>
                <Text style={styles.done}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Source</Text>

          <Field
            label="Where did the sheep come from? *"
            value={form.source}
            placeholder="Select source"
            options={SOURCES}
            onSelect={value =>
              setForm(prev => ({
                ...prev,
                source: value,
                motherId: '',
                fatherId: '',
              }))
            }
          />

          {form.source === 'Purchase' && (
            <AppInput
              label="Purchase Cost (PKR)"
              value={form.purchaseCost}
              onChangeText={value =>
                update('purchaseCost', value.replace(/[^0-9.]/g, ''))
              }
              placeholder="Enter purchase cost"
              keyboardType="decimal-pad"
            />
          )}

          {form.source === 'Farm Breeding' && (
            <>
              <Field
                label="Mother (Optional)"
                value={getSheepTagNumber(selectedMother) || ''}
                placeholder="Select mother"
                options={mothers.map(s => ({
                  label: `${getSheepTagNumber(s) || 'Sheep'} · ${
                    s.breed || 'Unknown breed'
                  }`,
                  value: s.sheep_id,
                }))}
                onSelect={value => update('motherId', value)}
                disabled={!mothers.length}
              />
              <Field
                label="Father (Optional)"
                value={getSheepTagNumber(selectedFather) || ''}
                placeholder="Select father"
                options={fathers.map(s => ({
                  label: `${getSheepTagNumber(s) || 'Sheep'} · ${
                    s.breed || 'Unknown breed'
                  }`,
                  value: s.sheep_id,
                }))}
                onSelect={value => update('fatherId', value)}
                disabled={!fathers.length}
              />
            </>
          )}

          <AppInput
            label="Notes (Optional)"
            value={form.notes}
            onChangeText={value => update('notes', value)}
            placeholder="Any additional information"
            multiline
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton
          title={loading ? 'Saving...' : 'Save Sheep'}
          onPress={saveSheep}
          loading={loading || loadingData}
        />
      </ScrollView>

      <Modal
        visible={picker === 'image'}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPicker(null)}>
          <View style={styles.modal}>
            <Text style={styles.cardTitle}>Sheep Photo</Text>
            <Text style={styles.subtitle}>Choose how to add a photo.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setPicker(null);
                chooseImage('camera');
              }}>
              <Text style={styles.secondaryText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setPicker(null);
                chooseImage('gallery');
              }}>
              <Text style={styles.secondaryText}>Choose from Gallery</Text>
            </TouchableOpacity>
            {image && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setImage(null);
                  setPicker(null);
                }}>
                <Text style={{color: '#C0392B', fontWeight: '700'}}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  placeholder,
  options,
  onSelect,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  const items = options.map(option =>
    typeof option === 'string' ? {label: option, value: option} : option,
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        disabled={disabled}
        style={[styles.select, disabled && {opacity: 0.5}]}
        onPress={() => setVisible(true)}>
        <Text style={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <Text style={styles.cardTitle}>{label}</Text>
            <ScrollView style={{maxHeight: 340}}>
              {items.map(item => (
                <TouchableOpacity
                  key={String(item.value)}
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}>
                  <Text style={styles.value}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F7F2'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 13,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {fontSize: 32, color: DARK, marginTop: -4},
  title: {fontSize: 22, fontWeight: '800', color: DARK},
  subtitle: {fontSize: 12, color: '#718078', marginTop: 4},
  content: {paddingHorizontal: 16, paddingBottom: 30},
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5ECE5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
    marginBottom: 8,
  },
  photo: {
    height: 140,
    borderRadius: 14,
    backgroundColor: '#EDF5EE',
    borderWidth: 1,
    borderColor: '#DCE9DD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  preview: {width: '100%', height: '100%'},
  photoIcon: {fontSize: 30, color: GREEN},
  photoText: {fontSize: 12, fontWeight: '700', color: GREEN, marginTop: 5},
  row: {flexDirection: 'row', gap: 10, marginBottom: 17},
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    backgroundColor: '#E8F4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {fontSize: 12, color: GREEN, fontWeight: '800'},
  tagBox: {
    minHeight: 48,
    paddingHorizontal: 13,
    backgroundColor: '#EFF6F0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  tagText: {fontSize: 15, color: DARK, fontWeight: '800'},
  autoText: {fontSize: 9, color: GREEN, fontWeight: '900'},
  field: {marginBottom: 15},
  select: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFE8E0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {fontSize: 13, color: DARK, flex: 1},
  placeholder: {fontSize: 13, color: '#8B978F', flex: 1},
  chevron: {fontSize: 20, color: GREEN, marginLeft: 8},
  gender: {
    flex: 1,
    padding: 13,
    borderWidth: 1,
    borderColor: '#DFE8E0',
    borderRadius: 12,
    alignItems: 'center',
  },
  genderActive: {backgroundColor: '#E8F4EC', borderColor: GREEN},
  genderText: {fontSize: 13, color: '#718078'},
  genderTextActive: {color: GREEN, fontWeight: '800'},
  dateButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFE8E0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {fontSize: 18, color: GREEN},
  datePanel: {
    marginTop: 10,
    alignItems: 'flex-end',
    backgroundColor: '#F7FAF7',
    borderRadius: 12,
  },
  done: {padding: 12, color: GREEN, fontWeight: '800'},
  error: {
    color: '#B93838',
    backgroundColor: '#FFF0EF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(10,30,20,0.45)',
    padding: 22,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    maxHeight: '75%',
  },
  modalButton: {
    padding: 14,
    backgroundColor: '#F0F6F0',
    borderRadius: 11,
    marginTop: 9,
    alignItems: 'center',
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEE8',
  },
});
