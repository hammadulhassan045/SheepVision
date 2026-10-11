import * as SecureStore from 'expo-secure-store';
import {supabase, isSupabaseConfigured} from '../config/supabase';

const SESSION_KEY = 'sheepvision.app.session';
const authListeners = new Set();

const notifySessionChange = nextSession => {
  authListeners.forEach(listener => listener(nextSession));
};

const normalizeEmail = value =>
  String(value || '')
    .trim()
    .toLowerCase();

const buildSession = user => ({
  user_id: user?.user_id || user?.id || user?.userId || null,
  email: user?.email || '',
  name: user?.name || user?.full_name || user?.fullName || 'SheepVision User',
  phone: user?.phone || '',
  accessToken: user?.accessToken || null,
});

export const invokeAppApi = async (body, accessToken) => {
  const {data, error} = await supabase.functions.invoke('app-api', {
    body,
    headers: accessToken
      ? {Authorization: `Bearer ${accessToken}`}
      : undefined,
  });

  if (error) {
    let responseBody;
    try {
      responseBody = await error.context?.json?.();
    } catch {
      responseBody = null;
    }
    const operationDescription = [
      responseBody?.stage,
      responseBody?.operation,
      responseBody?.object,
      responseBody?.bucket ? `bucket ${responseBody.bucket}` : null,
      responseBody?.path ? `path ${responseBody.path}` : null,
      responseBody?.code ? `code ${responseBody.code}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    const apiError = new Error(
      [
        responseBody?.error || error.message || 'SheepVision API request failed.',
        operationDescription,
      ]
        .filter(Boolean)
        .join(' — '),
    );
    apiError.code = responseBody?.code || null;
    apiError.details = responseBody?.details || null;
    apiError.hint = responseBody?.hint || null;
    apiError.stage = responseBody?.stage || null;
    apiError.object = responseBody?.object || null;
    apiError.operation = responseBody?.operation || null;
    apiError.bucket = responseBody?.bucket || null;
    apiError.path = responseBody?.path || null;
    throw apiError;
  }
  if (data?.error) {
    const apiError = new Error(data.error);
    apiError.code = data.code || null;
    throw apiError;
  }
  return data;
};

const saveSession = async session => {
  if (!session) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    notifySessionChange(null);
    return null;
  }

  const normalizedSession = buildSession(session);
  await SecureStore.setItemAsync(
    SESSION_KEY,
    JSON.stringify(normalizedSession),
  );
  notifySessionChange(normalizedSession);
  return normalizedSession;
};

export const getSession = async () => {
  try {
    const rawSession = await SecureStore.getItemAsync(SESSION_KEY);
    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);
    if (!parsedSession?.user_id || !parsedSession?.accessToken) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
    return parsedSession;
  } catch (error) {
    console.warn('Unable to read app session', error);
    return null;
  }
};

export const subscribeToAuthChanges = listener => {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
};

export const getCurrentUser = async () => {
  const session = await getSession();
  if (!session?.user_id) {
    return null;
  }

  const result = await invokeAppApi(
    {action: 'get-profile'},
    session.accessToken,
  );
  return result.user || null;
};

export const signIn = async ({identifier, password}) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }

  const cleanIdentifier = String(identifier || '').trim();
  if (!cleanIdentifier || !password) {
    throw new Error('Please enter your email and password.');
  }

  const result = await invokeAppApi({
    action: 'sign-in',
    identifier: cleanIdentifier,
    password: String(password),
  });
  const user = result.user;
  const session = await saveSession({...user, accessToken: result.accessToken});
  return {session, user};
};

export const registerUser = async ({fullName, email, phone, password}) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }

  const cleanFullName = String(fullName || '').trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = String(phone || '').trim();

  if (!cleanFullName || !cleanEmail || !cleanPhone || !password) {
    throw new Error('Please complete all required registration details.');
  }

  const result = await invokeAppApi({
    action: 'register',
    name: cleanFullName,
    email: cleanEmail,
    phone: cleanPhone,
    password: String(password),
  });
  const session = await saveSession({
    ...result.user,
    accessToken: result.accessToken,
  });
  return {session, user: result.user};
};

export const fetchUserProfile = async userId => {
  if (!userId) {
    return null;
  }

  const session = await getSession();
  if (!session?.accessToken || session.user_id !== userId) {
    return null;
  }
  const result = await invokeAppApi(
    {action: 'get-profile'},
    session.accessToken,
  );
  return result.user || null;
};

export const signOut = async () => {
  await saveSession(null);
};
