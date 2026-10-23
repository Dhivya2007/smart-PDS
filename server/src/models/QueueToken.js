import mongoose from 'mongoose';

const queueTokenSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    rationCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RationCard',
      required: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    tokenCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrDataUrl: {
      type: String,
      required: true,
    },
    qrPayload: {
      type: String, // Cryptographically tamper-resistant payload string
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'CANCELLED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const QueueToken = mongoose.model('QueueToken', queueTokenSchema);
export default QueueToken;
