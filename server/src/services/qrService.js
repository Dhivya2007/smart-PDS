import crypto from 'crypto';
import QRCode from 'qrcode';
import QueueToken from '../models/QueueToken.js';

const QR_SECRET = process.env.QR_SECRET || 'smart_pds_qr_token_hmac_secret_2026';

/**
 * Generate a unique token code and cryptographic QR payload
 */
export const generateQueueToken = async ({ booking, rationCard, shop }) => {
  const monthCycle = booking.monthCycle;
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
  const tokenCode = `PDS-TKN-${monthCycle.replace('-', '')}-${randomSuffix}`;

  // Booking details in payload
  const rawData = {
    tokenCode,
    bookingId: booking._id.toString(),
    rationCardNumber: rationCard.cardNumber,
    shopCode: shop.fpsCode,
    shopId: shop._id.toString(),
    dateString: booking.dateString,
    slotTime: booking.slotTime,
    headName: rationCard.headOfFamily.name,
    issuedAt: new Date().toISOString(),
  };

  // Generate HMAC signature to prevent forgery
  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(JSON.stringify(rawData))
    .digest('hex');

  const signedPayload = JSON.stringify({
    data: rawData,
    sig: signature,
  });

  // Generate QR Code base64 Data URL (high error correction level 'H')
  const qrDataUrl = await QRCode.toDataURL(signedPayload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#1e3a8a', // Deep navy blue matching government portal
      light: '#ffffff',
    },
    width: 320,
  });

  // Calculate token expiry (end of the booked day + 24 hours grace)
  const bookingDate = new Date(booking.bookingDate);
  const expiresAt = new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000);

  // Save to DB
  const queueToken = await QueueToken.create({
    bookingId: booking._id,
    rationCardId: rationCard._id,
    shopId: shop._id,
    tokenCode,
    qrDataUrl,
    qrPayload: signedPayload,
    status: 'ACTIVE',
    expiresAt,
  });

  return queueToken;
};

/**
 * Verify and decode a QR payload or token string
 */
export const verifyAndParseQR = (qrString) => {
  try {
    // If it's the signed JSON payload
    const parsed = JSON.parse(qrString);
    if (parsed.data && parsed.sig) {
      const expectedSig = crypto
        .createHmac('sha256', QR_SECRET)
        .update(JSON.stringify(parsed.data))
        .digest('hex');

      if (parsed.sig !== expectedSig) {
        return { valid: false, error: 'Cryptographic signature mismatch. Possible fraudulent QR code.' };
      }
      return { valid: true, data: parsed.data };
    }
    return { valid: false, error: 'Malformed QR payload structure.' };
  } catch (err) {
    // If it's a plain token code e.g. "PDS-TKN-202610-A9F7B2C1"
    if (typeof qrString === 'string' && qrString.startsWith('PDS-TKN-')) {
      return { valid: true, data: { tokenCode: qrString.trim() } };
    }
    return { valid: false, error: 'Invalid QR code data format.' };
  }
};
