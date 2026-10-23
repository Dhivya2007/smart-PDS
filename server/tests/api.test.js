import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import RationCard from '../src/models/RationCard.js';
import Shop from '../src/models/Shop.js';
import Booking from '../src/models/Booking.js';
import QueueToken from '../src/models/QueueToken.js';
import Stock from '../src/models/Stock.js';
import Payment from '../src/models/Payment.js';
import DistributionRecord from '../src/models/DistributionRecord.js';

describe('Smart Public Distribution System (Smart PDS) API Integration Tests', () => {
  let adminToken = '';
  let shopOwnerToken = '';
  let beneficiaryToken = '';
  let testShop = null;
  let testCard = null;
  let testUser = null;
  let activeTokenCode = '';

  before(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_pds';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  after(async () => {
    await mongoose.connection.close();
  });

  // 1. Health check
  it('GET /api/health should return status UP', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
  });

  // 2. Authentication and Authorization
  it('POST /api/auth/login should authenticate Admin and return JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@smartpds.gov.in',
      password: 'Admin@123',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.role, 'ADMIN');
    assert.ok(res.body.token);
    adminToken = res.body.token;
  });

  it('POST /api/auth/login should authenticate Shop Owner and return linked shop', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'owner.anna@smartpds.gov.in',
      password: 'Shop@123',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'SHOP_OWNER');
    assert.ok(res.body.token);
    shopOwnerToken = res.body.token;
    testShop = res.body.shop;
  });

  it('POST /api/auth/login should authenticate Beneficiary', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'meena.pds@gmail.com',
      password: 'Citizen@123',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'BENEFICIARY');
    assert.ok(res.body.token);
    beneficiaryToken = res.body.token;
    testUser = res.body.user;
    testCard = res.body.rationCard;
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@smartpds.gov.in',
      password: 'WrongPassword123!',
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 3. Ration Card Verification
  it('POST /api/ration-cards/verify should verify valid card and Aadhaar last 4', async () => {
    const res = await request(app).post('/api/ration-cards/verify').send({
      cardNumber: '330420384719',
      aadhaarLast4: '6192',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.card.cardType, 'AAY');
    assert.equal(res.body.card.monthlyEntitlement.riceKg, 35);
  });

  it('POST /api/ration-cards/verify should reject mismatched Aadhaar digits', async () => {
    const res = await request(app).post('/api/ration-cards/verify').send({
      cardNumber: '330420384719',
      aadhaarLast4: '9999',
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Aadhaar verification failed/);
  });

  // 4. Shop 15-Minute Slot Generation & Capacity
  it('GET /api/shops/:shopId/slots should generate 15-minute intervals', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const res = await request(app)
      .get(`/api/shops/${testShop._id}/slots?date=${tomorrowStr}`)
      .set('Authorization', `Bearer ${beneficiaryToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.slots.length > 0);
    // Check first slot format (e.g. 09:00 - 09:15)
    assert.match(res.body.slots[0].slotTime, /^\d{2}:\d{2} - \d{2}:\d{2}$/);
    assert.equal(res.body.slots[0].totalCapacity, 6);
  });

  // 5. Slot Booking and Duplicate Prevention
  it('POST /api/bookings should successfully book an available 15-minute slot', async () => {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 2);
    const dateStr = bookingDate.toISOString().slice(0, 10);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${beneficiaryToken}`)
      .send({
        dateString: dateStr,
        slotTime: '11:00 - 11:15',
        paymentMethod: 'ONLINE_MOCK',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.queueToken.tokenCode);
    assert.ok(res.body.queueToken.qrDataUrl);
    activeTokenCode = res.body.queueToken.tokenCode;
  });

  it('POST /api/bookings should REJECT duplicate active booking in the same monthly cycle', async () => {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 3);
    const dateStr = bookingDate.toISOString().slice(0, 10);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${beneficiaryToken}`)
      .send({
        dateString: dateStr,
        slotTime: '11:15 - 11:30',
        paymentMethod: 'CASH',
      });

    // Should reject because beneficiary already has a confirmed booking in this cycle
    assert.equal(res.status, 400);
    assert.match(res.body.message, /already exists/);
  });

  // 6. Payment Gateway Simulation (Success & Failure)
  it('POST /api/payments/simulate-online should simulate Mock Payment Failure', async () => {
    const booking = await Booking.findOne({ tokenCode: activeTokenCode });
    const payment = await Payment.findOne({ bookingId: booking._id });

    const res = await request(app)
      .post('/api/payments/simulate-online')
      .set('Authorization', `Bearer ${beneficiaryToken}`)
      .send({
        paymentId: payment._id,
        simulateStatus: 'FAILURE',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, false);
    assert.equal(res.body.status, 'FAILED');
  });

  it('POST /api/payments/simulate-online should simulate Mock Payment Success upon retry', async () => {
    const booking = await Booking.findOne({ tokenCode: activeTokenCode });
    const payment = await Payment.findOne({ bookingId: booking._id });

    const res = await request(app)
      .post('/api/payments/simulate-online')
      .set('Authorization', `Bearer ${beneficiaryToken}`)
      .send({
        paymentId: payment._id,
        simulateStatus: 'SUCCESS',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'COMPLETED');
    assert.ok(res.body.payment.gatewayResponse.bankReferenceId);
  });

  // 7. QR Token Verification by Shop Owner
  it('POST /api/distribution/verify-token should verify active token for shop owner', async () => {
    const res = await request(app)
      .post('/api/distribution/verify-token')
      .set('Authorization', `Bearer ${shopOwnerToken}`)
      .send({ tokenCode: activeTokenCode });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.token.tokenCode, activeTokenCode);
    assert.equal(res.body.allStockSufficient, true);
  });

  it('POST /api/distribution/verify-token should reject unauthorized shop owner token', async () => {
    // Authenticate owner of Shop 2
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'owner.tmgmt@smartpds.gov.in',
      password: 'Shop@123',
    });
    const shop2OwnerToken = loginRes.body.token;

    const res = await request(app)
      .post('/api/distribution/verify-token')
      .set('Authorization', `Bearer ${shop2OwnerToken}`)
      .send({ tokenCode: activeTokenCode });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Unauthorized: This token belongs to Fair Price Shop/);
  });

  // 8. Ration Distribution and Stock Update
  it('POST /api/distribution/confirm should disburse ration, deduct stock, and issue receipt', async () => {
    const stockBefore = await Stock.findOne({ shopId: testShop._id, commodity: 'RICE' });
    const initialRice = stockBefore.availableQuantity;

    const res = await request(app)
      .post('/api/distribution/confirm')
      .set('Authorization', `Bearer ${shopOwnerToken}`)
      .send({
        tokenCode: activeTokenCode,
        collectedByMemberName: 'Meenakshi Murugan',
        collectedByMemberAadhaarLast4: '6192',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.receipt.receiptNumber);

    // Verify stock was deducted by 35kg (AAY entitlement)
    const stockAfter = await Stock.findOne({ shopId: testShop._id, commodity: 'RICE' });
    assert.equal(stockAfter.availableQuantity, initialRice - 35);

    // Verify token status is now USED
    const token = await QueueToken.findOne({ tokenCode: activeTokenCode });
    assert.equal(token.status, 'USED');

    // Verify ration card marked as collected for this cycle
    const card = await RationCard.findById(testCard._id);
    assert.equal(card.lastCollectedMonth, new Date().toISOString().slice(0, 7));
  });

  // 9. Duplicate Distribution Prevention
  it('POST /api/distribution/confirm should REJECT duplicate distribution of already used token', async () => {
    const res = await request(app)
      .post('/api/distribution/confirm')
      .set('Authorization', `Bearer ${shopOwnerToken}`)
      .send({
        tokenCode: activeTokenCode,
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Token cannot be processed. Current status is USED/);
  });

  // 10. Admin-Only APIs and Access Control
  it('GET /api/admin/stats should reject non-admin request with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${beneficiaryToken}`);

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Forbidden: Access denied/);
  });

  it('GET /api/admin/stats should return comprehensive metrics for Admin', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.metrics.totalBeneficiaries >= 1);
    assert.ok(res.body.metrics.totalShops >= 2);
    assert.ok(res.body.charts.commodityBreakdown.length > 0);
  });

  // 11. Registration Form Validation & Beneficiary Registration
  it('POST /api/auth/register should reject missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      role: 'BENEFICIARY',
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Full Name is required/);
  });

  it('POST /api/auth/register should reject invalid 10-digit mobile numbers', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ramesh Citizen',
      email: 'ramesh.test@example.com',
      phone: '12345',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'BENEFICIARY',
      rationCardNumber: '330499887766',
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Mobile number must be exactly 10 digits/);
  });

  it('POST /api/auth/register should reject ration card that is not 12 numeric digits', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ramesh Citizen',
      email: 'ramesh.test@example.com',
      phone: '9840123999',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'BENEFICIARY',
      rationCardNumber: '12345678', // Only 8 digits
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /exactly 12 numeric digits/);
  });

  it('POST /api/auth/register should reject non-existent ration card', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ramesh Citizen',
      email: 'ramesh.test@example.com',
      phone: '9840123999',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'BENEFICIARY',
      rationCardNumber: '999999999999', // 12 digits, but not in DB
    });
    assert.equal(res.status, 404);
    assert.match(res.body.message, /not found/);
  });

  it('POST /api/auth/register should reject passwords that do not match', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ramesh Citizen',
      email: 'ramesh.test@example.com',
      phone: '9840123999',
      password: 'Password@123',
      confirmPassword: 'DifferentPassword@123',
      role: 'BENEFICIARY',
      rationCardNumber: '330499887766',
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /do not match/);
  });

  it('POST /api/auth/register should successfully register Beneficiary with 12-digit eligible card', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      phone: '9840123888',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'BENEFICIARY',
      rationCardNumber: '330499887766',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'BENEFICIARY');
    assert.equal(res.body.user.rationCardNumber, '330499887766');

    // Verify card is now linked in MongoDB
    const card = await RationCard.findOne({ cardNumber: '330499887766' });
    assert.ok(card.linkedUserId);
  });

  it('POST /api/auth/register should reject duplicate registration on already linked card', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Another Person',
      email: 'another.person@example.com',
      phone: '9840999111',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'BENEFICIARY',
      rationCardNumber: '330499887766', // Already linked in previous test!
    });
    assert.equal(res.status, 409);
    assert.match(res.body.message, /already registered and linked/);
  });

  // 12. FPS Shop Owner Registration and Pending Approval
  let pendingShopOwnerId = '';
  it('POST /api/auth/register should register Shop Owner with PENDING approval (no login token)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'M. Kannan',
      email: 'kannan.fps@example.com',
      phone: '9840333444',
      fpsCode: 'FPS-TN-04-003',
      shopName: 'Adyar Fair Price Shop #3',
      shopAddress: 'No. 8, Sardar Patel Road, Adyar, Chennai',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'SHOP_OWNER',
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.pendingApproval, true);
    assert.equal(res.body.token, undefined); // NO login token granted!
    assert.equal(res.body.user.isApproved, false);
    assert.equal(res.body.user.approvalStatus, 'PENDING');
    pendingShopOwnerId = res.body.user._id;
  });

  it('POST /api/auth/login should REJECT login for pending shop owner', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'kannan.fps@example.com',
      password: 'Password@123',
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.pendingApproval, true);
    assert.match(res.body.message, /pending administrator authorization/);
  });

  it('PATCH /api/admin/users/:id/approve should allow Admin to authorize and activate shop owner', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${pendingShopOwnerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.isApproved, true);
    assert.equal(res.body.user.isActive, true);
    assert.equal(res.body.user.approvalStatus, 'APPROVED');
  });

  it('POST /api/auth/login should now allow approved shop owner to log in', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'kannan.fps@example.com',
      password: 'Password@123',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'SHOP_OWNER');
  });
});
