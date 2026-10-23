import mongoose from 'mongoose';

const restockLogSchema = new mongoose.Schema(
  {
    quantityAdded: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    restockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    commodity: {
      type: String,
      enum: ['RICE', 'WHEAT', 'SUGAR', 'KEROSENE', 'DAL'],
      required: true,
    },
    commodityName: {
      type: String,
      required: true,
    },
    commodityNameTa: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      enum: ['kg', 'litre'],
      default: 'kg',
    },
    availableQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Available stock cannot be negative'],
    },
    allocatedMonthlyQuantity: {
      type: Number,
      default: 1000,
    },
    ratePerUnit: {
      type: Number,
      default: 0, // In INR, 0 for Rice under NFSA
    },
    lastRestockedAt: {
      type: Date,
      default: Date.now,
    },
    restockHistory: [restockLogSchema],
  },
  {
    timestamps: true,
  }
);

stockSchema.index({ shopId: 1, commodity: 1 }, { unique: true });

const Stock = mongoose.model('Stock', stockSchema);
export default Stock;
