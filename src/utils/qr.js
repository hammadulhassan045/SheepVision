export const generateSheepQrValue = (sheepId, tagNumber) => {
  if (!sheepId) return 'sheepvision://unknown-sheep';
  const tagQuery = tagNumber ? `?tag=${encodeURIComponent(tagNumber)}` : '';
  return `sheepvision://sheep/${String(sheepId)}${tagQuery}`;
};

export const parseSheepQrValue = value => {
  if (!value) return null;

  const trimmedValue = String(value).trim();
  const match = trimmedValue.match(/sheepvision:\/\/sheep\/([^?#]+)/i);

  if (match && match[1]) {
    return match[1];
  }

  return null;
};

export const getSheepTagNumber = sheep => {
  if (!sheep) return '';
  if (sheep.tag_number) return String(sheep.tag_number);
  const tagMatch = String(sheep.qr_code || '').match(/[?&]tag=([^&#]+)/i);
  if (tagMatch?.[1]) return decodeURIComponent(tagMatch[1]);
  return '';
};
