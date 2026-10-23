import mongoose from 'mongoose';

const distributedItemSchema = new mongoose.Schema(
  {
    commodity: {
      type: String,
      enum: ['RICE', 'WHEAT', 'SUGAR', 'KEROSENE', 'DAL'],
      required: true,
    },
    commodityName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    ratePerUnit: { type: Number, default: 0 },
    itemTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const distributionRecordSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    beneficiaryUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    distributedByShopOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    monthCycle: {
      type: String, // e.g. "2026-10"
      required: true,
      index: true,
    },
    itemsDistributed: [distributedItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE_MOCK'],
      required: true,
    },
    collectedByMember: {
      name: { type: String, default: 'Head of Family' },
      relation: { type: String, default: 'SELF' },
      aadhaarLast4: { type: String, default: 'XXXX' },
    },
    distributedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one distribution per ration card per monthCycle
distributionRecordSchema.index({ rationCardId: 1, monthCycle: 1 }, { unique: true });

const DistributionRecord = mongoose.model('DistributionRecord', distributionRecordSchema);
export default DistributionRecord;
