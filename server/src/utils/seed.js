import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import RationCard from '../models/RationCard.js';
import Stock from '../models/Stock.js';
import Booking from '../models/Booking.js';
import QueueToken from '../models/QueueToken.js';
import Payment from '../models/Payment.js';
import DistributionRecord from '../models/DistributionRecord.js';
import Notification from '../models/Notification.js';
import { generateQueueToken } from '../services/qrService.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_pds';
    console.log(`Connecting to MongoDB for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Shop.deleteMany({}),
      RationCard.deleteMany({}),
      Stock.deleteMany({}),
      Booking.deleteMany({}),
      QueueToken.deleteMany({}),
      Payment.deleteMany({}),
      DistributionRecord.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Existing collections cleared.');

    // 1. Create Shops
    console.log('Creating Fair Price Shops...');
    const shop1 = await Shop.create({
      fpsCode: 'FPS-TN-04-001',
      shopName: 'Anna Nagar Fair Price Shop #1',
      shopNameTa: 'அண்ணா நகர் நியாயவிலைக் கடை எண் 1',
      address: 'No. 14, 2nd Avenue, Anna Nagar West, Chennai',
      taluk: 'Aminjikarai',
      district: 'Chennai',
      pincode: '600040',
      contactNumber: '9840123456',
      operatingHours: { open: '09:00', close: '18:00', lunchStart: '13:00', lunchEnd: '14:00' },
      slotCapacity: 6,
      isActive: true,
    });

    const shop2 = await Shop.create({
      fpsCode: 'FPS-TN-04-002',
      shopName: 'T. Nagar Co-op Fair Price Shop',
      shopNameTa: 'தியாகராய நகர் கூட்டுறவு நியாயவிலைக் கடை',
      address: 'Plot 45, Usman Road, T. Nagar, Chennai',
      taluk: 'Mambalam',
      district: 'Chennai',
      pincode: '600017',
      contactNumber: '9840987654',
      operatingHours: { open: '09:00', close: '18:00', lunchStart: '13:00', lunchEnd: '14:00' },
      slotCapacity: 5,
      isActive: true,
    });

    // 2. Create Stock for Shops
    console.log('Initializing commodity stocks for shops...');
    const commodities1 = [
      { commodity: 'RICE', commodityName: 'Subsidized Rice (அரிசி)', unit: 'kg', availableQuantity: 5000, allocatedMonthlyQuantity: 6000, ratePerUnit: 0 },
      { commodity: 'WHEAT', commodityName: 'Whole Wheat (கோதுமை)', unit: 'kg', availableQuantity: 1200, allocatedMonthlyQuantity: 1500, ratePerUnit: 2 },
      { commodity: 'SUGAR', commodityName: 'Refined Sugar (சர்க்கரை)', unit: 'kg', availableQuantity: 600, allocatedMonthlyQuantity: 800, ratePerUnit: 13.5 },
      { commodity: 'KEROSENE', commodityName: 'Kerosene (மண்ணெண்ணெய்)', unit: 'litre', availableQuantity: 350, allocatedMonthlyQuantity: 500, ratePerUnit: 15 },
      { commodity: 'DAL', commodityName: 'Toor Dal (துவரம் பருப்பு)', unit: 'kg', availableQuantity: 400, allocatedMonthlyQuantity: 500, ratePerUnit: 30 },
    ];

    const commodities2 = [
      { commodity: 'RICE', commodityName: 'Subsidized Rice (அரிசி)', unit: 'kg', availableQuantity: 4200, allocatedMonthlyQuantity: 5000, ratePerUnit: 0 },
      { commodity: 'WHEAT', commodityName: 'Whole Wheat (கோதுமை)', unit: 'kg', availableQuantity: 950, allocatedMonthlyQuantity: 1200, ratePerUnit: 2 },
      { commodity: 'SUGAR', commodityName: 'Refined Sugar (சர்க்கரை)', unit: 'kg', availableQuantity: 500, allocatedMonthlyQuantity: 700, ratePerUnit: 13.5 },
      { commodity: 'KEROSENE', commodityName: 'Kerosene (மண்ணெண்ணெய்)', unit: 'litre', availableQuantity: 300, allocatedMonthlyQuantity: 400, ratePerUnit: 15 },
      { commodity: 'DAL', commodityName: 'Toor Dal (துவரம் பருப்பு)', unit: 'kg', availableQuantity: 350, allocatedMonthlyQuantity: 450, ratePerUnit: 30 },
    ];

    await Promise.all([
      ...commodities1.map((c) => Stock.create({ shopId: shop1._id, ...c })),
      ...commodities2.map((c) => Stock.create({ shopId: shop2._id, ...c })),
    ]);

    // 3. Create Ration Cards (12-Digit Standard Numeric Format)
    console.log('Creating Ration Cards...');
    // Card 1: Priority Household (PHH)
    const card1 = await RationCard.create({
      cardNumber: '330410293847',
      cardType: 'PHH',
      headOfFamily: {
        name: 'Kavitha Ramachandran',
        aadhaarLast4: '4821',
        gender: 'FEMALE',
        age: 46,
      },
      members: [
        { name: 'Ramachandran Sundaram', relation: 'SPOUSE', age: 50, gender: 'MALE', aadhaarLast4: '3819' },
        { name: 'Karthik Ramachandran', relation: 'SON', age: 24, gender: 'MALE', aadhaarLast4: '9283' },
        { name: 'Deepa Ramachandran', relation: 'DAUGHTER', age: 20, gender: 'FEMALE', aadhaarLast4: '7104' },
      ],
      address: {
        street: 'Door No. 12, 4th Cross Street',
        villageOrTown: 'Anna Nagar West',
        taluk: 'Aminjikarai',
        district: 'Chennai',
        pincode: '600040',
      },
      fpsId: shop1._id,
      monthlyEntitlement: {
        riceKg: 20,
        wheatKg: 5,
        sugarKg: 2,
        keroseneLitre: 1,
        dalKg: 1,
        subsidizedTotalAmount: 40,
      },
      lastCollectedMonth: '2026-09',
      isActive: true,
    });

    // Card 2: Antyodaya Anna Yojana (AAY) - Poorest category, 35kg rice
    const card2 = await RationCard.create({
      cardNumber: '330420384719',
      cardType: 'AAY',
      headOfFamily: {
        name: 'Meenakshi Murugan',
        aadhaarLast4: '6192',
        gender: 'FEMALE',
        age: 58,
      },
      members: [
        { name: 'Murugan Perumal', relation: 'SPOUSE', age: 62, gender: 'MALE', aadhaarLast4: '5512' },
        { name: 'Vetri Murugan', relation: 'SON', age: 28, gender: 'MALE', aadhaarLast4: '8834' },
      ],
      address: {
        street: '7B, Slum Clearance Board Tenements',
        villageOrTown: 'Anna Nagar',
        taluk: 'Aminjikarai',
        district: 'Chennai',
        pincode: '600040',
      },
      fpsId: shop1._id,
      monthlyEntitlement: {
        riceKg: 35,
        wheatKg: 5,
        sugarKg: 2,
        keroseneLitre: 2,
        dalKg: 2,
        subsidizedTotalAmount: 45,
      },
      lastCollectedMonth: null,
      isActive: true,
    });

    // Card 3: Non-Priority Household (NPHH)
    const card3 = await RationCard.create({
      cardNumber: '330430472819',
      cardType: 'NPHH',
      headOfFamily: {
        name: 'Anand Natarajan',
        aadhaarLast4: '7721',
        gender: 'MALE',
        age: 39,
      },
      members: [
        { name: 'Lakshmi Anand', relation: 'SPOUSE', age: 36, gender: 'FEMALE', aadhaarLast4: '4410' },
        { name: 'Siddharth Anand', relation: 'SON', age: 10, gender: 'MALE', aadhaarLast4: '3318' },
      ],
      address: {
        street: '22, Ranganathan Street',
        villageOrTown: 'T. Nagar',
        taluk: 'Mambalam',
        district: 'Chennai',
        pincode: '600017',
      },
      fpsId: shop2._id,
      monthlyEntitlement: {
        riceKg: 10,
        wheatKg: 3,
        sugarKg: 1,
        keroseneLitre: 1,
        dalKg: 1,
        subsidizedTotalAmount: 35,
      },
      lastCollectedMonth: '2026-09',
      isActive: true,
    });

    // Card 4: 12-Digit Unlinked card ready for fresh citizen test registration
    await RationCard.create({
      cardNumber: '330499887766',
      cardType: 'PHH',
      headOfFamily: {
        name: 'Suresh Kumar',
        aadhaarLast4: '1234',
        gender: 'MALE',
        age: 42,
      },
      members: [
        { name: 'Revathi Suresh', relation: 'SPOUSE', age: 38, gender: 'FEMALE', aadhaarLast4: '5678' },
      ],
      address: {
        street: '15, South Boag Road',
        villageOrTown: 'T. Nagar',
        taluk: 'Mambalam',
        district: 'Chennai',
        pincode: '600017',
      },
      fpsId: shop2._id,
      monthlyEntitlement: {
        riceKg: 20,
        wheatKg: 5,
        sugarKg: 2,
        keroseneLitre: 1,
        dalKg: 1,
        subsidizedTotalAmount: 40,
      },
      lastCollectedMonth: null,
      isActive: true,
    });

    // 4. Create Users (Admin, Shop Owners, Beneficiaries)
    console.log('Creating Users with secure password hashing...');
    // Admin
    const adminUser = await User.create({
      name: 'Dr. R. Balaji IAS (PDS Commissioner)',
      email: 'admin@smartpds.gov.in',
      phone: '9840001122',
      password: 'Admin@123',
      role: 'ADMIN',
      isActive: true,
    });

    // Shop Owner 1
    const owner1 = await User.create({
      name: 'P. Arumugam (FPS #001 Manager)',
      email: 'owner.anna@smartpds.gov.in',
      phone: '9840112233',
      password: 'Shop@123',
      role: 'SHOP_OWNER',
      shopId: shop1._id,
      isActive: true,
    });
    shop1.ownerId = owner1._id;
    await shop1.save();

    // Shop Owner 2
    const owner2 = await User.create({
      name: 'V. Senthil Nathan (T.Nagar FPS Manager)',
      email: 'owner.tmgmt@smartpds.gov.in',
      phone: '9840445566',
      password: 'Shop@123',
      role: 'SHOP_OWNER',
      shopId: shop2._id,
      isActive: true,
    });
    shop2.ownerId = owner2._id;
    await shop2.save();

    // Beneficiary 1
    const beneficiary1 = await User.create({
      name: 'Karthik Ramachandran',
      email: 'karthik.pds@gmail.com',
      phone: '9840998877',
      password: 'Citizen@123',
      role: 'BENEFICIARY',
      rationCardNumber: card1.cardNumber,
      rationCardId: card1._id,
      isActive: true,
    });
    card1.linkedUserId = beneficiary1._id;
    await card1.save();

    // Beneficiary 2
    const beneficiary2 = await User.create({
      name: 'Meenakshi Murugan',
      email: 'meena.pds@gmail.com',
      phone: '9840776655',
      password: 'Citizen@123',
      role: 'BENEFICIARY',
      rationCardNumber: card2.cardNumber,
      rationCardId: card2._id,
      isActive: true,
    });
    card2.linkedUserId = beneficiary2._id;
    await card2.save();

    // Beneficiary 3
    const beneficiary3 = await User.create({
      name: 'Anand Natarajan',
      email: 'anand.pds@gmail.com',
      phone: '9840554433',
      password: 'Citizen@123',
      role: 'BENEFICIARY',
      rationCardNumber: card3.cardNumber,
      rationCardId: card3._id,
      isActive: true,
    });
    card3.linkedUserId = beneficiary3._id;
    await card3.save();

    // 5. Create Sample Active Booking & QR Token for Beneficiary 1
    console.log('Generating active sample booking and QR token...');
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10);
    const monthCycle = dateString.slice(0, 7);

    const booking1 = new Booking({
      rationCardId: card1._id,
      userId: beneficiary1._id,
      shopId: shop1._id,
      bookingDate: today,
      dateString,
      slotTime: '10:00 - 10:15',
      monthCycle,
      status: 'CONFIRMED',
    });
    await booking1.save();

    const queueToken1 = await generateQueueToken({
      booking: booking1,
      rationCard: card1,
      shop: shop1,
    });

    booking1.tokenRef = queueToken1._id;
    booking1.tokenCode = queueToken1.tokenCode;
    await booking1.save();

    // Create payment record for booking1
    await Payment.create({
      bookingId: booking1._id,
      rationCardId: card1._id,
      userId: beneficiary1._id,
      shopId: shop1._id,
      amount: card1.monthlyEntitlement.subsidizedTotalAmount || 40,
      paymentMethod: 'ONLINE_MOCK',
      status: 'COMPLETED',
      transactionId: `PDS-MCK-${Date.now()}-A8F`,
      paidAt: new Date(),
      gatewayResponse: {
        gatewayType: 'mock',
        status: 'SUCCESS',
        bankReferenceId: 'BNK-MOCK-748920',
      },
    });

    // 6. Create Sample Past Distribution Record (September 2026 for Beneficiary 3)
    console.log('Creating sample past distribution record for analytics and receipt history...');
    const pastBooking = await Booking.create({
      rationCardId: card3._id,
      userId: beneficiary3._id,
      shopId: shop2._id,
      bookingDate: new Date('2026-09-15T10:30:00Z'),
      dateString: '2026-09-15',
      slotTime: '10:30 - 10:45',
      monthCycle: '2026-09',
      status: 'DISTRIBUTED',
      tokenCode: 'PDS-TKN-202609-PAST01',
      distributedAt: new Date('2026-09-15T10:40:00Z'),
    });

    const pastPayment = await Payment.create({
      bookingId: pastBooking._id,
      rationCardId: card3._id,
      userId: beneficiary3._id,
      shopId: shop2._id,
      amount: 35,
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      transactionId: 'PDS-CSH-202609-PAST',
      paidAt: new Date('2026-09-15T10:40:00Z'),
      collectedBy: owner2._id,
    });

    await DistributionRecord.create({
      receiptNumber: 'RCP-202609-902184',
      bookingId: pastBooking._id,
      rationCardId: card3._id,
      shopId: shop2._id,
      beneficiaryUserId: beneficiary3._id,
      distributedByShopOwnerId: owner2._id,
      monthCycle: '2026-09',
      itemsDistributed: [
        { commodity: 'RICE', commodityName: 'Subsidized Rice (அரிசி)', quantity: 10, unit: 'kg', ratePerUnit: 0, itemTotal: 0 },
        { commodity: 'WHEAT', commodityName: 'Whole Wheat (கோதுமை)', quantity: 3, unit: 'kg', ratePerUnit: 2, itemTotal: 6 },
        { commodity: 'SUGAR', commodityName: 'Refined Sugar (சர்க்கரை)', quantity: 1, unit: 'kg', ratePerUnit: 13.5, itemTotal: 13.5 },
        { commodity: 'KEROSENE', commodityName: 'Kerosene Oil (மண்ணெண்ணெய்)', quantity: 1, unit: 'litre', ratePerUnit: 15, itemTotal: 15 },
      ],
      totalAmount: 34.5,
      paymentId: pastPayment._id,
      paymentMethod: 'CASH',
      collectedByMember: {
        name: 'Anand Natarajan',
        relation: 'HEAD_OF_FAMILY',
        aadhaarLast4: '7721',
      },
      distributedAt: new Date('2026-09-15T10:40:00Z'),
    });

    // 7. Seed Initial Notifications
    console.log('Creating initial notifications...');
    await Notification.create({
      userId: beneficiary1._id,
      title: 'Slot Confirmed: 10:00 - 10:15 Today',
      titleTa: 'இன்றைய நேர இடைவெளி உறுதி செய்யப்பட்டது: 10:00 - 10:15',
      message: `Your token ${queueToken1.tokenCode} is ready. Present QR code at Anna Nagar Fair Price Shop.`,
      messageTa: `உங்கள் டோக்கன் ${queueToken1.tokenCode} தயாராக உள்ளது. அண்ணா நகர் நியாயவிலைக் கடையில் QR குறியீட்டைக் காண்பிக்கவும்.`,
      type: 'BOOKING',
      metadata: { bookingId: booking1._id, tokenCode: queueToken1.tokenCode },
      isRead: false,
    });

    await Notification.create({
      userId: adminUser._id,
      title: 'System Startup Alert',
      titleTa: 'கணினி துவக்க எச்சரிக்கை',
      message: 'Smart Public Distribution System initialized with Fair Price Shops and beneficiary records.',
      messageTa: 'ஸ்மார்ட் பொது விநியோகத் திட்டம் வெற்றிகரமாக துவக்கப்பட்டது.',
      type: 'SYSTEM',
      isRead: true,
    });

    console.log('\n============================================================');
    console.log('  Database Seeding Completed Successfully! ');
    console.log('============================================================');
    console.log('  Admin Login:');
    console.log('    Email:    admin@smartpds.gov.in');
    console.log('    Password: Admin@123\n');
    console.log('  Shop Owner Logins:');
    console.log('    Anna Nagar FPS:  owner.anna@smartpds.gov.in  /  Shop@123');
    console.log('    T. Nagar FPS:    owner.tmgmt@smartpds.gov.in /  Shop@123\n');
    console.log('  Beneficiary Logins:');
    console.log('    PHH Cardholder:  karthik.pds@gmail.com       /  Citizen@123 (Active Token: ' + queueToken1.tokenCode + ')');
    console.log('    AAY Cardholder:  meena.pds@gmail.com         /  Citizen@123 (35kg Rice Entitlement)');
    console.log('    NPHH Cardholder: anand.pds@gmail.com         /  Citizen@123\n');
    console.log('  Unlinked 12-Digit Test Card for Registration:');
    console.log('    Card Number:  330499887766');
    console.log('    Aadhaar Last 4: 1234');
    console.log('============================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
};

seedDatabase();
