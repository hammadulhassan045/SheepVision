import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
const GENDERS = ['Female', 'Male'];
const SOURCES = ['Farm Breeding', 'Purchase'];

const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AddSheepScreen({navigation, route}) {
  const farm = route?.params?.farm || null;
  const [sheep, setSheep] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [form, setForm] = useState({
    tagNumber: '',
    breed: '',
    gender: 'Female',
    dob: '',
    source: '',
    motherId: '',
    fatherId: '',
    purchaseCost: '',
    notes: '',
    flockId: route?.params?.flockId || '',
  });
  const [flocks, setFlocks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadFarmData = async () => {
      if (!farm?.farm_id) {
        return;
      }

      try {
        const session = await getSession();
        if (!session?.accessToken) {
          throw new Error('Sign in again to register sheep.');
        }
        const {tagNumber, flocks: flockData, sheep: sheepData} =
          await fetchSheepRegistrationData(
            farm.farm_id,
            session.accessToken,
          );
        if (!isActive) {
          return;
        }

        setSheep(sheepData);
        setFlocks(flockData || []);
        setForm(previous => ({
          ...previous,
          tagNumber,
          flockId:
            previous.flockId ||
            flockData?.[0]?.flock_id ||
            route?.params?.flockId ||
            '',
        }));
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError?.message || 'Unable to load farm registration data.',
          );
        }
      }
    };

    loadFarmData();
    return () => {
      isActive = false;
    };
  }, [farm?.farm_id, route?.params?.flockId]);

  const mothers = useMemo(
    () => sheep.filter(item => item.gender?.toLowerCase() === 'female'),
    [sheep],
  );
  const fathers = useMemo(
    () => sheep.filter(item => item.gender?.toLowerCase() === 'male'),
    [sheep],
  );

  const updateValue = (key, value) =>
    setForm(previous => ({...previous, [key]: value}));

  const handleSelectImage = async source => {
    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError('Camera access is needed to take a sheep photo.');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setError('Photo access is needed to choose an image.');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
        setError('');
      }
    } catch (imageError) {
      setError(imageError?.message || 'Unable to open the photo option.');
    }
  };

  const handleSave = async () => {
    const validationError = validateSheepForm({
      ...form,
      flockId: form.flockId || route?.params?.flockId,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.accessToken) {
        throw new Error('Your secure session is missing. Sign in again.');
      }
      const currentTagNumber = await getNextSheepTagNumber(
        session.accessToken,
      );
      if (currentTagNumber !== form.tagNumber) {
        updateValue('tagNumber', currentTagNumber);
        setError('A new tag number was assigned. Please tap Save Sheep again.');
        return;
      }

      const savedSheep = await createSheepRecord(
        {
          farm_id: farm?.farm_id,
          flock_id: form.flockId || route?.params?.flockId,
          tag_number: form.tagNumber,
          gender: form.gender,
          dob: form.dob || null,
          breed: form.breed,
          source: form.source,
          mother_id:
            form.source === 'Farm Breeding' ? form.motherId || null : null,
          father_id:
            form.source === 'Farm Breeding' ? form.fatherId || null : null,
          notes: form.notes,
        },
        selectedImage,
        session.accessToken,
      );

      let purchaseExpenseError = null;
      if (form.source === 'Purchase') {
        try {
          await createSheepPurchaseExpense({
            farmId: farm?.farm_id,
            sheepId: savedSheep.sheep_id,
            cost: form.purchaseCost,
            accessToken: session.accessToken,
          });
        } catch (expenseError) {
          purchaseExpenseError = `Sheep was registered, but its purchase expense could not be saved: ${
            expenseError?.message || 'unknown error'
          }`;
        }
      }

      navigation.replace('SheepRegistrationSuccess', {
        sheep: savedSheep,
        farm,
        flockId: form.flockId || route?.params?.flockId,
        purchaseCost: form.purchaseCost,
        purchaseExpenseError,
      });
    } catch (saveError) {
      setError(saveError?.message || 'Unable to register sheep.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (_event, selectedDate) => {
    if (!selectedDate) {
      return;
    }
    updateValue('dob', formatDate(selectedDate));
  };

  const handleOpenDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: form.dob ? new Date(`${form.dob}T00:00:00`) : new Date(),
        mode: 'date',
        display: 'default',
        maximumDate: new Date(),
        onValueChange: handleDateChange,
      });
      return;
    }

    setDatePickerVisible(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Register Sheep</Text>
        <Text style={styles.subtitle}>Capture essential sheep details</Text>

        <View style={styles.imageBox}>
          {selectedImage?.uri ? (
            <Image source={{uri: selectedImage.uri}} style={styles.preview} />
          ) : (
            <Text style={styles.imagePlaceholder}>Add Sheep Image</Text>
          )}
        </View>
        <View style={styles.imageActions}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => handleSelectImage('camera')}
            style={styles.imageButton}>
            <Text style={styles.imageButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => handleSelectImage('gallery')}
            style={styles.imageButton}>
            <Text style={styles.imageButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          {selectedImage?.uri ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setSelectedImage(null)}
              style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <AppInput
          label="Tag Number"
          value={form.tagNumber}
          editable={false}
          placeholder="Generating..."
        />
        <SelectionField
          label="Breed"
          value={form.breed}
          placeholder="Select Breed"
          options={BREEDS}
          onSelect={value => updateValue('breed', value)}
        />
        <SelectionField
          label="Gender"
          value={form.gender}
          options={GENDERS}
          onSelect={value => updateValue('gender', value)}
        />
        <SelectionField
          label="Flock"
          value={flocks.find(flock => flock.flock_id === form.flockId)?.name}
          placeholder={
            flocks.length ? 'Select Flock' : 'No flocks registered for this farm.'
          }
          options={flocks.map(flock => ({
            label: flock.name,
            value: flock.flock_id,
          }))}
          disabled={!flocks.length}
          onSelect={value => updateValue('flockId', value)}
        />

        <Text style={styles.fieldLabel}>Date of Birth</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleOpenDatePicker}
          style={styles.selectButton}>
          <Text style={form.dob ? styles.selectedText : styles.placeholderText}>
            {form.dob || 'Select Date of Birth'}
          </Text>
          <Text style={styles.selectArrow}>▾</Text>
        </Pressable>
        {datePickerVisible && Platform.OS === 'ios' ? (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={form.dob ? new Date(`${form.dob}T00:00:00`) : new Date()}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onValueChange={handleDateChange}
            />
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setDatePickerVisible(false)}
              style={styles.dateDoneButton}>
              <Text style={styles.dateDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <SelectionField
          label="Source"
          value={form.source}
          placeholder="Select Source"
          options={SOURCES}
          onSelect={value =>
            setForm(previous => ({
              ...previous,
              source: value,
              motherId: '',
              fatherId: '',
            }))
          }
        />
        {form.source === 'Purchase' ? (
          <AppInput
            label="Purchase Cost"
            value={form.purchaseCost}
            onChangeText={value =>
              updateValue('purchaseCost', value.replace(/[^0-9.]/g, ''))
            }
            placeholder="Enter cost"
            keyboardType="decimal-pad"
          />
        ) : null}
        {form.source === 'Farm Breeding' ? (
          <>
            <SelectionField
              label="Mother"
              value={
                getSheepTagNumber(
                  sheep.find(item => item.sheep_id === form.motherId),
                ) || (form.motherId ? 'Existing sheep' : '')
              }
              placeholder={
                mothers.length
                  ? 'Select Mother'
                  : 'No female sheep registered yet.'
              }
              options={mothers.map(item => ({
                label: `${
                  getSheepTagNumber(item) || 'Existing sheep'
                } — Female — ${item.breed || 'Breed not set'}`,
                value: item.sheep_id,
              }))}
              disabled={!mothers.length}
              onSelect={value => updateValue('motherId', value)}
            />
            <SelectionField
              label="Father"
              value={
                getSheepTagNumber(
                  sheep.find(item => item.sheep_id === form.fatherId),
                ) || (form.fatherId ? 'Existing sheep' : '')
              }
              placeholder={
                fathers.length
                  ? 'Select Father'
                  : 'No male sheep registered yet.'
              }
              options={fathers.map(item => ({
                label: `${
                  getSheepTagNumber(item) || 'Existing sheep'
                } — Male — ${item.breed || 'Breed not set'}`,
                value: item.sheep_id,
              }))}
              disabled={!fathers.length}
              onSelect={value => updateValue('fatherId', value)}
            />
          </>
        ) : null}

        <AppInput
          label="Notes"
          value={form.notes}
          onChangeText={value => updateValue('notes', value)}
          placeholder="Special notes"
          multiline
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Save Sheep" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SelectionField({
  label,
  value,
  placeholder = 'Select',
  options,
  onSelect,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  const normalizedOptions = options.map(option =>
    typeof option === 'string' ? {label: option, value: option} : option,
  );

  return (
    <View style={styles.selectionField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{disabled}}
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}>
        <Text style={value ? styles.selectedText : styles.placeholderText}>
          {value || placeholder}
        </Text>
        {!disabled ? <Text style={styles.selectArrow}>▾</Text> : null}
      </Pressable>
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setVisible(false)}>
          <Pressable
            style={styles.optionsPanel}
            onPress={event => event.stopPropagation()}>
            <Text style={styles.optionsTitle}>Select {label}</Text>
            <ScrollView>
              {normalizedOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(option.value);
                    setVisible(false);
                  }}
                  style={styles.option}>
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  content: {padding: 22, paddingTop: 48, paddingBottom: 30},
  title: {fontSize: 30, fontWeight: '800', color: '#0F2E24', marginBottom: 8},
  subtitle: {fontSize: 15, color: '#536861', marginBottom: 18},
  imageBox: {
    backgroundColor: '#EAF8F1',
    borderRadius: 18,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCEFE3',
    marginBottom: 12,
  },
  preview: {width: '100%', height: '100%', borderRadius: 18},
  imagePlaceholder: {color: '#0F8A5F', fontWeight: '700'},
  imageActions: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18},
  imageButton: {
    backgroundColor: '#0F8A5F',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  imageButtonText: {color: '#fff', fontWeight: '700'},
  removeButton: {backgroundColor: '#FDEAEA', padding: 12, borderRadius: 12},
  removeButtonText: {color: '#B73030', fontWeight: '700'},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D2A24',
    marginBottom: 8,
  },
  selectionField: {marginBottom: 16},
  selectButton: {
    minHeight: 52,
    backgroundColor: '#F6FAF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEDE4',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonDisabled: {opacity: 0.8},
  selectedText: {fontSize: 15, color: '#1B2A27', flex: 1},
  placeholderText: {fontSize: 15, color: '#7C8B82', flex: 1},
  selectArrow: {fontSize: 18, color: '#648074', marginLeft: 8},
  datePickerContainer: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#F6FAF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEDE4',
    overflow: 'hidden',
  },
  dateDoneButton: {padding: 12, alignItems: 'flex-end'},
  dateDoneText: {color: '#176B4B', fontWeight: '700'},
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  optionsPanel: {
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
  },
  optionsTitle: {
    color: '#183D2F',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EFEA',
  },
  optionText: {fontSize: 15, color: '#1B2A27'},
  error: {color: '#D64545', fontSize: 13, marginBottom: 12},
});
