import React from 'react';
import QRCode from 'react-native-qrcode-svg';

export default function SheepQRCode({value, size = 190}) {
  return (
    <QRCode
      value={String(value || '')}
      size={size}
      logo={require('../../assets/sheep-qr-logo.png')}
      logoSize={size * 0.26}
      logoMargin={3}
      logoBackgroundColor="#FFFFFF"
      logoBorderRadius={4}
      ecl="H"
    />
  );
}
