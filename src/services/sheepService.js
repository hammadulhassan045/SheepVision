import {File} from 'expo-file-system';
import {supabase, isSupabaseConfigured} from '../config/supabase';
import {invokeAppApi} from './authService';

export const getNextSheepTagNumber = async accessToken => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }
  if (!accessToken) {
    throw new Error('Sign in again to register sheep.');
  }
  const result = await invokeAppApi({action: 'next-sheep-tag'}, accessToken);
  return result.tagNumber;
};

export const fetchSheepRegistrationData = async (farmId, accessToken) => {
  if (!farmId || !accessToken) {
    throw new Error('A farm and signed-in session are required.');
  }
  return invokeAppApi(
    {action: 'farm-registration-data', farmId},
    accessToken,
  );
};

export const fetchSheepByFarm = async farmId => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const {data, error} = await supabase
    .from('sheep')
    .select('*')
    .eq('farm_id', farmId);
  if (error) {
    throw error;
  }
  return data || [];
};

export const fetchSheepById = async sheepId => {
  if (!isSupabaseConfigured) {
    return null;
  }

  const {data, error} = await supabase
    .from('sheep')
    .select('*')
    .eq('sheep_id', sheepId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
};

export const fetchSheepByQrCode = async qrCode => {
  if (!isSupabaseConfigured) {
    return null;
  }

  const {data, error} = await supabase
    .from('sheep')
    .select('*')
    .eq('qr_code', qrCode)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
};

export const createSheepRecord = async (
  payload,
  imageFile = null,
  accessToken,
) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }

  if (!payload.tag_number) {
    throw new Error('Unable to generate a sheep tag number.');
  }

  if (!accessToken) {
    throw new Error('Your secure session is missing. Sign in again.');
  }

  let image = null;
  if (imageFile?.uri) {
    const sourceFile = new File(imageFile.uri);
    if (sourceFile.size > 6_000_000) {
      throw new Error('Choose a sheep image smaller than 6 MB.');
    }
    image = {
      base64: await sourceFile.base64(),
      fileName: imageFile.fileName || sourceFile.name || 'sheep-image.jpg',
      contentType:
        imageFile.mimeType || sourceFile.type || 'image/jpeg',
    };
  }

  const result = await invokeAppApi(
    {action: 'create-sheep', sheep: payload, image},
    accessToken,
  );
  return result.sheep;
};

export const createSheepPurchaseExpense = async ({
  farmId,
  sheepId,
  cost,
  accessToken,
}) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }

  if (!accessToken) {
    throw new Error('Your secure session is missing. Sign in again.');
  }
  const result = await invokeAppApi(
    {
      action: 'create-purchase-expense',
      farmId,
      sheepId,
      cost,
    },
    accessToken,
  );
  return result.expense;
};
