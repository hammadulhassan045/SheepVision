export const isValidEmail = value =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const isValidPhone = value => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8;
};

export const validateRegisterForm = ({fullName, email, password}) => {
  if (!fullName || !String(fullName).trim()) {
    return 'Full name is required.';
  }

  if (!email || !isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }

  if (!password || String(password).trim().length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
};

export const validateLoginForm = ({identifier, password}) => {
  if (!identifier || !String(identifier).trim()) {
    return 'Email or phone is required.';
  }

  if (!password || String(password).trim().length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
};

export const validateFarmForm = values => {
  if (!values.name || !String(values.name).trim())
    return 'Farm name is required.';
  if (!values.address || !String(values.address).trim())
    return 'Address is required.';
  if (!values.district || !String(values.district).trim())
    return 'District is required.';
  if (!values.province || !String(values.province).trim())
    return 'Province is required.';
  if (!values.country || !String(values.country).trim())
    return 'Country is required.';
  return null;
};

export const validateSheepForm = values => {
  if (!values.tagNumber || !String(values.tagNumber).trim())
    return 'Tag number is required.';
  if (!values.breed || !String(values.breed).trim())
    return 'Breed is required.';
  if (!values.gender) return 'Gender is required.';
  if (!values.flockId) return 'Please select a flock.';
  if (!values.source) return 'Please select a source.';
  if (!values.dob) return 'Please select the date of birth.';
  if (
    new Date(`${values.dob}T00:00:00`).getTime() >
    new Date().setHours(0, 0, 0, 0)
  ) {
    return 'Date of birth cannot be in the future.';
  }
  if (values.source === 'Purchase') {
    const purchaseCost = Number(values.purchaseCost);
    if (
      !values.purchaseCost ||
      !Number.isFinite(purchaseCost) ||
      purchaseCost <= 0
    ) {
      return 'Enter the purchase cost.';
    }
  }
  return null;
};
