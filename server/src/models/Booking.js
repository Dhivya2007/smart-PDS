import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    rationCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RationCard',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    dateString: {
      type: String, // e.g. "2026-10-21"
      required: true,
      index: true,
    },
    slotTime: {
      type: String, // e.g. "09:00 - 09:15"
      required: true,
    },
    monthCycle: {
      type: String, // e.g. "2026-10"
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'DISTRIBUTED', 'CANCELLED', 'EXPIRED'],
      default: 'CONFIRMED',
      index: true,
    },
    tokenRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueueToken',
      default: null,
    },
    tokenCode: {
      type: String,
      default: null,
      index: true,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    distributedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for slot checking
bookingSchema.index({ shopId: 1, dateString: 1, slotTime: 1, status: 1 });

// Partial index to enforce only one active CONFIRMED booking per ration card per month cycle
bookingSchema.index(
  { rationCardId: 1, monthCycle: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'CONFIRMED' },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
