import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    fpsCode: {
      type: String,
      required: [true, 'FPS shop code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    shopNameTa: {
      type: String,
      trim: true,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      type: String,
      required: true,
    },
    taluk: {
      type: String,
      required: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    operatingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      lunchStart: { type: String, default: '13:00' },
      lunchEnd: { type: String, default: '14:00' },
    },
    slotDurationMinutes: {
      type: Number,
      default: 15,
    },
    slotCapacity: {
      type: Number,
      default: 6, // 6 citizens per 15-minute slot
      min: [1, 'Capacity must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;
