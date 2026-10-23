import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    aadhaarLast4: {
      type: String,
      required: true,
      match: [/^\d{4}$/, 'Must be last 4 digits of Aadhaar'],
    },
  },
  { _id: false }
);

const rationCardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: [true, 'Ration card number is required'],
      unique: true,
      trim: true,
      match: [/^\d{12}$/, 'Smart Ration Card Number must be exactly 12 numeric digits'],
      index: true,
    },
    cardType: {
      type: String,
      enum: ['AAY', 'PHH', 'NPHH'],
      required: true,
      index: true,
    },
    headOfFamily: {
      name: { type: String, required: true, trim: true },
      aadhaarLast4: {
        type: String,
        required: true,
        match: [/^\d{4}$/, 'Must be last 4 digits of Aadhaar'],
      },
      gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'FEMALE' },
      age: { type: Number, required: true },
    },
    members: [memberSchema],
    address: {
      street: { type: String, required: true },
      villageOrTown: { type: String, required: true },
      taluk: { type: String, required: true },
      district: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    fpsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    monthlyEntitlement: {
      riceKg: { type: Number, default: 20 },
      wheatKg: { type: Number, default: 5 },
      sugarKg: { type: Number, default: 2 },
      keroseneLitre: { type: Number, default: 1 },
      dalKg: { type: Number, default: 1 },
      subsidizedTotalAmount: { type: Number, default: 40 }, // Nominal cost in INR
    },
    lastCollectedMonth: {
      type: String, // e.g. "2026-09"
      default: null,
      index: true,
    },
    lastCollectionDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    linkedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if eligible for a given monthCycle (e.g. "2026-10")
rationCardSchema.methods.isEligibleForCycle = function (monthCycle) {
  if (!this.isActive) return { eligible: false, reason: 'Ration card is inactive or suspended' };
  if (this.lastCollectedMonth === monthCycle) {
    return {
      eligible: false,
      reason: `Ration quota has already been collected for the cycle ${monthCycle}`,
    };
  }
  return { eligible: true };
};

const RationCard = mongoose.model('RationCard', rationCardSchema);
export default RationCard;
