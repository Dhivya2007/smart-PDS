import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RationCard from '../models/RationCard.js';
import Shop from '../models/Shop.js';

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'smart_pds_jwt_super_secret_key_change_in_production_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Password complexity regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/]{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const RATION_CARD_REGEX = /^\d{12}$/;

// Register a new user
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      rationCardNumber,
      fpsCode,
      shopName,
      shopAddress,
    } = req.body;

    const targetRole = role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'BENEFICIARY';

    // 1. Mandatory Common Fields Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email Address is required.' });
    }
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: '10-Digit Mobile Number is required.' });
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.',
      });
    }

    // 2. Password Strength & Match Validation
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
      });
    }

    // 3. Uniqueness Check for Email and Phone
    const existingEmailUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingPhoneUser = await User.findOne({ phone: phone.trim() });
    if (existingPhoneUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this mobile number already exists.',
      });
    }

    // -------------------------------------------------------------
    // CITIZEN BENEFICIARY REGISTRATION
    // -------------------------------------------------------------
    if (targetRole === 'BENEFICIARY') {
      if (!rationCardNumber || !rationCardNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Smart Ration Card Number is required.',
        });
      }

      const cleanCardNum = rationCardNumber.trim();
      if (!RATION_CARD_REGEX.test(cleanCardNum)) {
        return res.status(400).json({
          success: false,
          message: 'Smart Ration Card Number must be exactly 12 numeric digits.',
        });
      }

      // Verify against database
      const linkedRationCard = await RationCard.findOne({ cardNumber: cleanCardNum });
      if (!linkedRationCard) {
        return res.status(404).json({
          success: false,
          message: `Smart Ration Card #${cleanCardNum} was not found in the national/state PDS database. Please verify your 12-digit number.`,
        });
      }

      if (!linkedRationCard.isActive) {
        return res.status(400).json({
          success: false,
          message: `Smart Ration Card #${cleanCardNum} is currently inactive or suspended. Cannot register.`,
        });
      }

      if (linkedRationCard.linkedUserId) {
        return res.status(409).json({
          success: false,
          message: 'This Smart Ration Card is already registered and linked to another beneficiary account.',
        });
      }

      // Create Beneficiary User
      const newUser = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: 'BENEFICIARY',
        rationCardNumber: linkedRationCard.cardNumber,
        rationCardId: linkedRationCard._id,
        isActive: true,
        isApproved: true,
        approvalStatus: 'APPROVED',
      });

      // Atomically link card
      linkedRationCard.linkedUserId = newUser._id;
      await linkedRationCard.save();

      const token = generateToken(newUser._id, newUser.role);
      const populatedCard = await RationCard.findById(linkedRationCard._id).populate('fpsId');

      return res.status(201).json({
        success: true,
        message: 'Citizen account registered and Smart Ration Card successfully linked.',
        token,
        user: newUser.toJSON(),
        rationCard: populatedCard,
      });
    }

    // -------------------------------------------------------------
    // FPS SHOP OWNER REGISTRATION (Pending Administrator Approval)
    // -------------------------------------------------------------
    if (targetRole === 'SHOP_OWNER') {
      if (!fpsCode || !fpsCode.trim()) {
        return res.status(400).json({ success: false, message: 'Fair Price Shop ID is required.' });
      }
      if (!shopName || !shopName.trim()) {
        return res.status(400).json({ success: false, message: 'Shop Name is required.' });
      }
      if (!shopAddress || !shopAddress.trim()) {
        return res.status(400).json({ success: false, message: 'Shop Address is required.' });
      }

      const cleanFpsCode = fpsCode.trim().toUpperCase();

      // Check if shop exists
      let linkedShop = await Shop.findOne({ fpsCode: cleanFpsCode });
      if (linkedShop && linkedShop.ownerId) {
        return res.status(409).json({
          success: false,
          message: `Fair Price Shop with ID ${cleanFpsCode} already has an assigned owner.`,
        });
      }

      if (!linkedShop) {
        // Create initial pending shop entry
        linkedShop = await Shop.create({
          fpsCode: cleanFpsCode,
          shopName: shopName.trim(),
          address: shopAddress.trim(),
          taluk: 'General',
          district: 'Chennai',
          pincode: '600001',
          contactNumber: phone.trim(),
          isActive: false, // Inactive until administrator approves
        });
      }

      // Create Shop Owner with pending approval
      const newUser = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: 'SHOP_OWNER',
        shopId: linkedShop._id,
        shopDetails: {
          fpsCode: cleanFpsCode,
          shopName: shopName.trim(),
          address: shopAddress.trim(),
        },
        isActive: false, // Inactive until approved
        isApproved: false, // Pending administrator authorization
        approvalStatus: 'PENDING',
      });

      // Link owner to shop
      linkedShop.ownerId = newUser._id;
      await linkedShop.save();

      // Return 201 WITHOUT login token because account requires admin approval
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message:
          'Your Fair Price Shop Owner account has been submitted and is currently pending authorization by the Civil Supplies Administrator. You will be able to log in once approved.',
        user: newUser.toJSON(),
      });
    }
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Explicitly select password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if shop owner is pending administrator approval
    if (user.role === 'SHOP_OWNER' && (!user.isApproved || user.approvalStatus === 'PENDING')) {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        message:
          'Your Fair Price Shop Owner account is currently pending administrator authorization. Please wait for an administrator to approve your account before signing in.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact PDS administration.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    // Fetch related entities
    let rationCard = null;
    let shop = null;

    if (user.rationCardId) {
      rationCard = await RationCard.findById(user.rationCardId).populate('fpsId');
    }
    if (user.shopId) {
      shop = await Shop.findById(user.shopId);
    } else if (user.role === 'SHOP_OWNER') {
      shop = await Shop.findOne({ ownerId: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toJSON(),
      rationCard,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// Get current profile
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    let rationCard = null;
    let shop = null;

    if (user.rationCardId) {
      rationCard = await RationCard.findById(user.rationCardId).populate('fpsId');
    }
    if (user.shopId) {
      shop = await Shop.findById(user.shopId);
    } else if (user.role === 'SHOP_OWNER') {
      shop = await Shop.findOne({ ownerId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      rationCard,
      shop,
    });
  } catch (error) {
    next(error);
  }
};
