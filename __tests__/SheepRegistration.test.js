import {
  generateSheepQrValue,
  getSheepTagNumber,
  parseSheepQrValue,
} from '../src/utils/qr';
import {validateSheepForm} from '../src/utils/validation';

const validForm = {
  tagNumber: 'SH-0001',
  breed: 'Lohi',
  gender: 'Female',
  dob: '2024-01-15',
  source: 'Farm Breeding',
  motherId: '',
  fatherId: '',
  flockId: 'flock-id',
};

it('keeps the display tag in the QR value while parsing the stable sheep ID', () => {
  const sheepId = '69cfac73-c6c3-43b3-809d-4a73275bdcff';
  const qrValue = generateSheepQrValue(sheepId, 'SH-0001');

  expect(parseSheepQrValue(qrValue)).toBe(sheepId);
  expect(getSheepTagNumber({qr_code: qrValue})).toBe('SH-0001');
  expect(getSheepTagNumber({tag_number: 'SH-0002', qr_code: qrValue})).toBe(
    'SH-0002',
  );
});

it('requires DOB and source, and rejects future dates', () => {
  expect(validateSheepForm({...validForm, dob: ''})).toBe(
    'Please select the date of birth.',
  );
  expect(validateSheepForm({...validForm, source: ''})).toBe(
    'Please select a source.',
  );
  expect(
    validateSheepForm({
      ...validForm,
      dob: `${new Date().getFullYear() + 1}-01-01`,
    }),
  ).toBe('Date of birth cannot be in the future.');
});

it('does not require parent selection for purchase source', () => {
  expect(
    validateSheepForm({
      ...validForm,
      source: 'Purchase',
      purchaseCost: '25000',
      motherId: '',
      fatherId: '',
    }),
  ).toBeNull();
});

it('requires a positive purchase cost for purchased sheep', () => {
  expect(
    validateSheepForm({...validForm, source: 'Purchase', purchaseCost: ''}),
  ).toBe('Enter the purchase cost.');
  expect(
    validateSheepForm({...validForm, source: 'Purchase', purchaseCost: '0'}),
  ).toBe('Enter the purchase cost.');
  expect(
    validateSheepForm({
      ...validForm,
      source: 'Purchase',
      purchaseCost: '25000',
    }),
  ).toBeNull();
});
