import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import AppButton from '../components/AppButton';
import SheepQRCode from '../components/SheepQRCode';
import {getSession} from '../services/authService';
import {createSheepPurchaseExpense} from '../services/sheepService';
import {getSheepTagNumber} from '../utils/qr';

export default function SheepRegistrationSuccessScreen({navigation, route}) {
  const sheep = route?.params?.sheep;
  const farm = route?.params?.farm;
  const flockId = route?.params?.flockId;
  const tagNumber = getSheepTagNumber(sheep);
  const [expenseError, setExpenseError] = useState(
    route?.params?.purchaseExpenseError || '',
  );
  const [expenseLoading, setExpenseLoading] = useState(false);

  const retryPurchaseExpense = async () => {
    try {
      setExpenseLoading(true);
      const session = await getSession();
      await createSheepPurchaseExpense({
        farmId: farm?.farm_id,
        sheepId: sheep?.sheep_id,
        cost: route?.params?.purchaseCost,
        accessToken: session?.accessToken,
      });
      setExpenseError('');
    } catch (error) {
      setExpenseError(
        error?.message || 'Unable to save the purchase cost as an expense.',
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.title}>Sheep Registered Successfully</Text>

      <View style={styles.passport}>
        <Text style={styles.label}>Tag Number</Text>
        <Text style={styles.tag}>{tagNumber}</Text>

        <View style={styles.qrWrap}>
          <SheepQRCode value={sheep?.qr_code || sheep?.sheep_id} size={190} />
        </View>
        <Text style={styles.qrHint}>Scan this code to find this sheep.</Text>

        <InfoRow label="Breed" value={sheep?.breed} />
        <InfoRow label="Gender" value={sheep?.gender} />
        <InfoRow label="Date of Birth" value={sheep?.dob} />
        <InfoRow label="Source" value={sheep?.source} />
        {sheep?.source === 'Purchase' ? (
          <InfoRow label="Purchase Cost" value={route?.params?.purchaseCost} />
        ) : null}
      </View>
      {expenseError ? (
        <View style={styles.expenseWarning}>
          <Text style={styles.expenseWarningText}>{expenseError}</Text>
          <AppButton
            title="Retry Saving Expense"
            onPress={retryPurchaseExpense}
            loading={expenseLoading}
          />
        </View>
      ) : null}

      <AppButton
        title="View Sheep"
        onPress={() =>
          navigation.replace('SheepDetails', {sheepId: sheep?.sheep_id})
        }
        style={styles.action}
      />
      <AppButton
        title="Register Another Sheep"
        variant="secondary"
        textStyle={styles.secondaryText}
        onPress={() => navigation.replace('AddSheep', {farm, flockId})}
        style={styles.action}
      />
    </ScrollView>
  );
}

function InfoRow({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not recorded'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4FBF7'},
  content: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 36,
    alignItems: 'stretch',
  },
  check: {
    alignSelf: 'center',
    color: '#FFFFFF',
    backgroundColor: '#0F8A5F',
    fontSize: 34,
    fontWeight: '800',
    width: 64,
    height: 64,
    borderRadius: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  title: {
    color: '#0F2E24',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  passport: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#DDEFE4',
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  label: {color: '#567069', fontSize: 13, fontWeight: '600'},
  tag: {color: '#0F2E24', fontSize: 28, fontWeight: '800', marginTop: 4},
  qrWrap: {padding: 14, backgroundColor: '#FFFFFF', marginTop: 16},
  qrHint: {color: '#567069', fontSize: 13, marginTop: 4, marginBottom: 16},
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E7F0EA',
  },
  value: {color: '#183D2F', fontSize: 14, fontWeight: '700'},
  action: {minHeight: 54, marginBottom: 12},
  secondaryText: {color: '#0F8A5F'},
  expenseWarning: {
    backgroundColor: '#FFF4E5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  expenseWarningText: {color: '#7A4B00', fontSize: 13, marginBottom: 10},
});
