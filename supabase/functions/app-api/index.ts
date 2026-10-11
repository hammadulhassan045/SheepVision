import {createClient} from 'npm:@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@3';
import {SignJWT, jwtVerify} from 'npm:jose@5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {...corsHeaders, 'Content-Type': 'application/json'},
  });

const operationError = (
  error: {message?: string; code?: string; details?: string; hint?: string},
  context: Record<string, string | null>,
) =>
  Object.assign(new Error(error.message || 'Supabase operation failed.'), {
    code: error.code || null,
    details: error.details || null,
    hint: error.hint || null,
    ...context,
  });

const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('The server database configuration is incomplete.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {autoRefreshToken: false, persistSession: false},
  });
};

const getSessionSecret = () => {
  const secret = Deno.env.get('SHEEPVISION_SESSION_SECRET')?.trim();
  if (!secret || secret.length < 32) {
    throw Object.assign(
      new Error(
        'Server configuration is missing SHEEPVISION_SESSION_SECRET. Set it as a Supabase Edge Function secret and redeploy app-api.',
      ),
      {code: 'SERVER_CONFIGURATION_ERROR'},
    );
  }
  return new TextEncoder().encode(secret);
};

const issueAccessToken = async (userId: string) =>
  new SignJWT({role: 'sheepvision_user'})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getSessionSecret());

const getAuthenticatedUserId = async (request: Request) => {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token) {
    throw new Error('Your session is missing. Sign in again.');
  }
  const {payload} = await jwtVerify(token, getSessionSecret());
  if (!payload.sub || payload.role !== 'sheepvision_user') {
    throw new Error('Your session is invalid. Sign in again.');
  }
  return payload.sub;
};

const toPublicUser = (user: Record<string, unknown>) => ({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
  phone: user.phone,
});

const authenticate = async (
  admin: ReturnType<typeof getSupabaseAdmin>,
  identifier: string,
  password: string,
) => {
  const cleanIdentifier = identifier.trim();
  const column = cleanIdentifier.includes('@') ? 'email' : 'phone';
  const value =
    column === 'email' ? cleanIdentifier.toLowerCase() : cleanIdentifier;
  const {data: user, error} = await admin
    .from('users')
    .select('user_id, name, email, phone, password')
    .eq(column, value)
    .maybeSingle();

  if (error) {throw error;}
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Incorrect email or password.');
  }
  return user;
};

const getNextTag = async (admin: ReturnType<typeof getSupabaseAdmin>) => {
  let highest = 0;
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const {data, error} = await admin
      .from('sheep')
      .select('tag_number')
      .order('sheep_id', {ascending: true})
      .range(from, from + pageSize - 1);
    if (error) {throw error;}
    highest = (data || []).reduce((max, sheep) => {
      const match = String(sheep.tag_number || '').match(/^SH-(\d+)$/i);
      return match ? Math.max(max, Number(match[1])) : max;
    }, highest);
    if (!data || data.length < pageSize) {break;}
  }
  return `SH-${String(highest + 1).padStart(4, '0')}`;
};

const requireFarmOwner = async (
  admin: ReturnType<typeof getSupabaseAdmin>,
  farmId: string,
  userId: string,
) => {
  const {data: farm, error} = await admin
    .from('farms')
    .select('farm_id')
    .eq('farm_id', farmId)
    .eq('owner_id', userId)
    .maybeSingle();
  if (error) {throw error;}
  if (!farm) {
    throw new Error('You do not have permission to add records to this farm.');
  }
};

const uploadSheepImage = async (
  admin: ReturnType<typeof getSupabaseAdmin>,
  image: {base64: string; fileName?: string; contentType?: string} | null,
  farmId: string,
  sheepId: string,
) => {
  if (!image) {return {path: null, publicUrl: null};}
  if (!image.base64 || image.base64.length > 8_000_000) {
    throw new Error('The selected image is empty or too large to upload.');
  }

  const contentType = image.contentType || 'image/jpeg';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
    throw new Error('Choose a JPEG, PNG, or WebP sheep image.');
  }

  const binary = atob(image.base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const safeName = (image.fileName || 'sheep-image.jpg').replace(
    /[^a-zA-Z0-9._-]/g,
    '_',
  );
  const path = `${farmId}/${sheepId}-${safeName}`;
  const {data, error} = await admin.storage
    .from('SheepVision')
    .upload(path, bytes, {contentType, upsert: false});
  if (error) {
    throw operationError(error, {
      stage: 'storage-upload',
      object: 'storage.objects',
      operation: 'INSERT',
      bucket: 'SheepVision',
      path,
    });
  }

  const {data: urlData} = admin.storage
    .from('SheepVision')
    .getPublicUrl(data.path);
  if (!urlData.publicUrl) {
    await admin.storage.from('SheepVision').remove([data.path]);
    throw new Error('The uploaded image does not have a public URL.');
  }
  return {path: data.path, publicUrl: urlData.publicUrl};
};

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders});
  }
  if (request.method !== 'POST') {
    return jsonResponse({error: 'Method not allowed.'}, 405);
  }
  let uploadedImagePath: string | null = null;
  try {
    const admin = getSupabaseAdmin();
    const body = await request.json();
    const action = String(body.action || '');

    if (action === 'sign-in') {
      const identifier = String(body.identifier || '');
      const password = String(body.password || '');
      if (!identifier.trim() || !password) {
        return jsonResponse({error: 'Enter your account and password.'}, 400);
      }
      const user = await authenticate(admin, identifier, password);
      return jsonResponse({
        user: toPublicUser(user),
        accessToken: await issueAccessToken(user.user_id),
      });
    }

    if (action === 'register') {
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const password = String(body.password || '');
      if (!name || !email || !phone || !password) {
        return jsonResponse({error: 'Complete all required account details.'}, 400);
      }

      const {data: existing, error: lookupError} = await admin
        .from('users')
        .select('user_id')
        .eq('email', email)
        .maybeSingle();
      if (lookupError) {throw lookupError;}
      if (existing) {
        return jsonResponse(
          {error: 'An account with this email already exists.'},
          409,
        );
      }

      const {data: user, error} = await admin
        .from('users')
        .insert({
          name,
          email,
          phone,
          password: await bcrypt.hash(password, 10),
        })
        .select('user_id, name, email, phone')
        .single();
      if (error) {throw error;}
      return jsonResponse({
        user,
        accessToken: await issueAccessToken(user.user_id),
      });
    }

    const userId = await getAuthenticatedUserId(request);

    if (action === 'get-profile') {
      const {data: user, error} = await admin
        .from('users')
        .select('user_id, name, email, phone')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {throw error;}
      return jsonResponse({user});
    }

    if (action === 'next-sheep-tag') {
      return jsonResponse({tagNumber: await getNextTag(admin)});
    }

    if (action === 'farm-registration-data') {
      const farmId = String(body.farmId || '');
      if (!farmId) {
        return jsonResponse({error: 'Select a farm to register sheep.'}, 400);
      }
      await requireFarmOwner(admin, farmId, userId);
      const [{data: flocks, error: flockError}, {data: sheep, error: sheepError}] =
        await Promise.all([
          admin.from('flocks').select('*').eq('farm_id', farmId),
          admin.from('sheep').select('*').eq('farm_id', farmId),
        ]);
      if (flockError) {throw flockError;}
      if (sheepError) {throw sheepError;}
      return jsonResponse({
        tagNumber: await getNextTag(admin),
        flocks: flocks || [],
        sheep: sheep || [],
      });
    }

    if (action === 'create-sheep') {
      const payload = body.sheep || {};
      const farmId = String(payload.farm_id || '');
      const flockId = String(payload.flock_id || '');
      const tagNumber = String(payload.tag_number || '');
      if (
        !farmId ||
        !flockId ||
        !/^SH-\d+$/i.test(tagNumber) ||
        !payload.gender ||
        !payload.breed ||
        !['Farm Breeding', 'Purchase'].includes(payload.source) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(payload.dob || '') ||
        new Date(`${payload.dob}T00:00:00`).getTime() > Date.now()
      ) {
        return jsonResponse({error: 'Sheep registration details are incomplete.'}, 400);
      }

      await requireFarmOwner(admin, farmId, userId);
      const {data: flock, error: flockError} = await admin
        .from('flocks')
        .select('flock_id')
        .eq('flock_id', flockId)
        .eq('farm_id', farmId)
        .maybeSingle();
      if (flockError) {throw flockError;}
      if (!flock) {
        return jsonResponse({error: 'Select a flock belonging to this farm.'}, 400);
      }

      for (const [parentId, expectedGender] of [
        [payload.mother_id, 'female'],
        [payload.father_id, 'male'],
      ]) {
        if (!parentId) {continue;}
        const {data: parent, error: parentError} = await admin
          .from('sheep')
          .select('sheep_id, gender')
          .eq('sheep_id', parentId)
          .eq('farm_id', farmId)
          .maybeSingle();
        if (parentError) {throw parentError;}
        if (
          !parent ||
          String(parent.gender || '').toLowerCase() !== expectedGender
        ) {
          return jsonResponse(
            {error: `Select a registered ${expectedGender} sheep from this farm.`},
            400,
          );
        }
      }

      const sheepId = crypto.randomUUID();
      const image = body.image || null;
      let registrationStage = 'sheep-insert';
      if (image) {
        registrationStage = 'storage-upload';
      }
      const uploaded = await uploadSheepImage(admin, image, farmId, sheepId);
      uploadedImagePath = uploaded.path;
      registrationStage = 'sheep-insert';
      const qrCode = `sheepvision://sheep/${sheepId}?tag=${encodeURIComponent(tagNumber)}`;

      const {data: sheep, error} = await admin
        .from('sheep')
        .insert({
          sheep_id: sheepId,
          farm_id: farmId,
          flock_id: flockId,
          tag_number: tagNumber,
          qr_code: qrCode,
          gender: payload.gender,
          dob: payload.dob,
          breed: payload.breed,
          source: payload.source,
          mother_id: payload.mother_id || null,
          father_id: payload.father_id || null,
          image_url: uploaded.publicUrl,
          notes: payload.notes || '',
        })
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          if (uploadedImagePath) {
            await admin.storage.from('SheepVision').remove([uploadedImagePath]);
            uploadedImagePath = null;
          }
          return jsonResponse(
            {error: 'This sheep tag is already in use. Refresh the tag and retry.', code: error.code},
            409,
          );
        }
        throw operationError(error, {
          stage: registrationStage,
          object: 'public.sheep',
          operation: 'INSERT',
          bucket: null,
          path: null,
        });
      }
      return jsonResponse({sheep});
    }

    if (action === 'create-purchase-expense') {
      const farmId = String(body.farmId || '');
      const sheepId = String(body.sheepId || '');
      const numericCost = Number(body.cost);
      if (!farmId || !sheepId || !Number.isFinite(numericCost) || numericCost <= 0) {
        return jsonResponse({error: 'A valid farm, sheep, and purchase cost are required.'}, 400);
      }
      await requireFarmOwner(admin, farmId, userId);
      const {data: sheep, error: sheepError} = await admin
        .from('sheep')
        .select('sheep_id, tag_number')
        .eq('sheep_id', sheepId)
        .eq('farm_id', farmId)
        .maybeSingle();
      if (sheepError) {throw sheepError;}
      if (!sheep) {
        return jsonResponse({error: 'The sheep does not belong to this farm.'}, 400);
      }

      const {data: existing, error: lookupError} = await admin
        .from('expenses')
        .select('expense_id')
        .eq('reference_type', 'sheep')
        .eq('reference_id', sheepId)
        .limit(1);
      if (lookupError) {throw lookupError;}
      if (existing?.length) {return jsonResponse({expense: existing[0]});}

      const today = new Date();
      const expenseDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-');
      const {data: expense, error} = await admin
        .from('expenses')
        .insert({
          farm_id: farmId,
          type: 'Sheep Purchase',
          expense_date: expenseDate,
          amount: numericCost,
          description: `Purchase of sheep ${sheep.tag_number}`,
          reference_type: 'sheep',
          reference_id: sheepId,
          sheep_id: sheepId,
          created_by: userId,
        })
        .select()
        .single();
      if (error) {throw error;}
      return jsonResponse({expense});
    }

    return jsonResponse({error: 'Unknown SheepVision API action.'}, 400);
  } catch (error) {
    let cleanupError: string | null = null;
    if (uploadedImagePath) {
      const admin = getSupabaseAdmin();
      const {error: removeError} = await admin.storage
        .from('SheepVision')
        .remove([uploadedImagePath]);
      if (removeError) {
        cleanupError = removeError.message;
      }
    }
    const message =
      error instanceof Error ? error.message : 'The server request failed.';
    const failure = error as {
      code?: string | null;
      details?: string | null;
      hint?: string | null;
      stage?: string | null;
      object?: string | null;
      operation?: string | null;
      bucket?: string | null;
      path?: string | null;
    };
    const code = failure.code || null;
    const status = /session|sign in|jwt|token/i.test(message)
      ? 401
      : code || /server configuration/i.test(message)
        ? 500
        : 400;
    return jsonResponse(
      {
        error: message,
        code,
        details: failure.details || null,
        hint: failure.hint || null,
        stage: failure.stage || null,
        object: failure.object || null,
        operation: failure.operation || null,
        bucket: failure.bucket || null,
        path: failure.path || uploadedImagePath,
        cleanupError,
      },
      status,
    );
  }
});
