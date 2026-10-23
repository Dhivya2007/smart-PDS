import Booking from '../models/Booking.js';
import Shop from '../models/Shop.js';

/**
 * Generate 15-minute time slot strings between two HH:mm times
 */
const generateTimeSlots = (startStr, endStr, durationMinutes = 15) => {
  const slots = [];
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  let current = startH * 60 + startM;
  const finish = endH * 60 + endM;

  while (current + durationMinutes <= finish) {
    const sH = String(Math.floor(current / 60)).padStart(2, '0');
    const sM = String(current % 60).padStart(2, '0');
    const eTime = current + durationMinutes;
    const eH = String(Math.floor(eTime / 60)).padStart(2, '0');
    const eM = String(eTime % 60).padStart(2, '0');

    slots.push(`${sH}:${sM} - ${eH}:${eM}`);
    current = eTime;
  }
  return slots;
};

/**
 * Get all available 15-minute slots for a given shop and date
 * with atomic real-time capacity calculations
 */
export const getAvailableSlotsForShopAndDate = async (shopId, dateString) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error('Fair Price Shop not found');
  }

  const { open, close, lunchStart, lunchEnd } = shop.operatingHours;
  const duration = shop.slotDurationMinutes || 15;
  const slotCapacity = shop.slotCapacity || 6;

  // Generate morning and afternoon slot batches
  const morningSlots = generateTimeSlots(open, lunchStart, duration);
  const afternoonSlots = generateTimeSlots(lunchEnd, close, duration);
  const allSlotIntervals = [...morningSlots, ...afternoonSlots];

  // Aggregate current confirmed bookings for this shop and date
  const bookingCounts = await Booking.aggregate([
    {
      $match: {
        shopId: shop._id,
        dateString: dateString,
        status: { $in: ['CONFIRMED', 'DISTRIBUTED'] },
      },
    },
    {
      $group: {
        _id: '$slotTime',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = {};
  bookingCounts.forEach((item) => {
    countMap[item._id] = item.count;
  });

  // Build slot availability list
  const slotsWithCapacity = allSlotIntervals.map((slot) => {
    const booked = countMap[slot] || 0;
    const remaining = Math.max(0, slotCapacity - booked);
    return {
      slotTime: slot,
      totalCapacity: slotCapacity,
      bookedCount: booked,
      remainingCapacity: remaining,
      isAvailable: remaining > 0,
    };
  });

  return {
    shopId: shop._id,
    shopName: shop.shopName,
    fpsCode: shop.fpsCode,
    dateString,
    totalSlots: slotsWithCapacity.length,
    slots: slotsWithCapacity,
  };
};
