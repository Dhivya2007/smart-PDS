import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  UserPlus,
  User,
  Store,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  CreditCard,
  Building,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Account Type: 'BENEFICIARY' | 'SHOP_OWNER'
  const [role, setRole] = useState('BENEFICIARY');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rationCardNumber: '',
    fpsCode: '',
    shopName: '',
    shopAddress: '',
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // Field change handler with numeric filtering
  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanVal = value;

    // Digits only for phone and rationCardNumber
    if (name === 'phone') {
      cleanVal = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'rationCardNumber') {
      cleanVal = value.replace(/\D/g, '').slice(0, 12);
    }

    setFormData((prev) => ({ ...prev, [name]: cleanVal }));
    setServerError(null);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Moderate', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Validation errors
  const errors = {};
  if (!formData.name.trim()) {
    errors.name = 'Full Name is required.';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email Address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address (e.g. citizen@example.com).';
  }

  if (!formData.phone.trim()) {
    errors.phone = '10-Digit Mobile Number is required.';
  } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
    errors.phone = 'Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.';
  }

  if (role === 'BENEFICIARY') {
    if (!formData.rationCardNumber.trim()) {
      errors.rationCardNumber = 'Smart Ration Card Number is required.';
    } else if (!/^\d{12}$/.test(formData.rationCardNumber)) {
      errors.rationCardNumber = 'Smart Ration Card Number must be exactly 12 numeric digits.';
    }
  }

  if (role === 'SHOP_OWNER') {
    if (!formData.fpsCode.trim()) {
      errors.fpsCode = 'Fair Price Shop ID is required.';
    }
    if (!formData.shopName.trim()) {
      errors.shopName = 'Shop Name is required.';
    }
    if (!formData.shopAddress.trim()) {
      errors.shopAddress = 'Shop Address is required.';
    }
  }

  if (!formData.password) {
    errors.password = 'Password is required.';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/])/.test(
      formData.password
    )
  ) {
    errors.password =
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required.';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  const isFormValid = Object.keys(errors).length === 0;

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
    setTouched(allTouched);

    if (!isFormValid) {
      setServerError('Please complete all required fields correctly before submitting.');
      return;
    }

    setLoading(true);
    setServerError(null);
    setSuccessInfo(null);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role,
        ...(role === 'BENEFICIARY'
          ? { rationCardNumber: formData.rationCardNumber.trim() }
          : {
              fpsCode: formData.fpsCode.trim().toUpperCase(),
              shopName: formData.shopName.trim(),
              shopAddress: formData.shopAddress.trim(),
            }),
      };

      const data = await register(payload);

      if (data) {
        if (role === 'BENEFICIARY') {
          setSuccessInfo({
            title: 'Account Created Successfully!',
            message:
              'Your Smart Ration Card has been verified and linked to your account. Redirecting to your dashboard...',
          });
          setTimeout(() => {
            navigate('/beneficiary/dashboard');
          }, 1800);
        } else if (role === 'SHOP_OWNER') {
          setSuccessInfo({
            title: 'Registration Submitted for Authorization',
            message:
              data.message ||
              'Your Fair Price Shop Owner account has been created and is pending approval by the Civil Supplies Administrator. You will be able to log in once an administrator authorizes your account.',
            isPending: true,
          });
        }
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          'Registration could not be completed. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl w-full space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gov-navy text-white flex items-center justify-center text-3xl shadow-lg border border-blue-800 mb-3">
            🌾
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create PDS Account
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Register your Smart Ration Card or Fair Price Shop.
          </p>
        </div>

        {/* Development Test Card Notice (Clean, non-sensitive) */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-bold">Development Testing Card Available:</p>
            <p className="text-blue-800">
              For testing citizen registration, use eligible test Smart Ration Card:{' '}
              <strong className="font-mono bg-blue-100 text-blue-950 px-2 py-0.5 rounded border border-blue-300">
                330499887766
              </strong>{' '}
              (12 numeric digits).
            </p>
          </div>
        </div>

        {/* Form Card Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Account Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setRole('BENEFICIARY');
                  setServerError(null);
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  role === 'BENEFICIARY'
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Citizen Beneficiary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('SHOP_OWNER');
                  setServerError(null);
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  role === 'SHOP_OWNER'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>FPS Shop Owner</span>
              </button>
            </div>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Registration Error</p>
                <p className="mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successInfo && (
            <div className="mb-5 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successInfo.title}</span>
              </div>
              <p className="leading-relaxed text-slate-700">{successInfo.message}</p>
              {successInfo.isPending && (
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline"
                  >
                    Return to Sign In Page
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* The Registration Form */}
          {!successInfo?.isPending && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    placeholder="Enter full legal name"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 transition ${
                      touched.name && errors.name
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {touched.name && errors.name && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.name}</p>
                )}
              </div>

              {/* 2. Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="e.g. citizen@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 transition ${
                      touched.email && errors.email
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.email}</p>
                )}
              </div>

              {/* 3. 10-Digit Mobile Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  10-Digit Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    placeholder="Enter 10-digit mobile number"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl font-mono text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 transition ${
                      touched.phone && errors.phone
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.phone}</p>
                )}
              </div>

              {/* CITIZEN BENEFICIARY SPECIFIC: 4. Smart Ration Card Number */}
              {role === 'BENEFICIARY' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Smart Ration Card Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="rationCardNumber"
                      maxLength={12}
                      value={formData.rationCardNumber}
                      onChange={handleChange}
                      onBlur={() => handleBlur('rationCardNumber')}
                      placeholder="Enter 12-digit ration card number"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 transition ${
                        touched.rationCardNumber && errors.rationCardNumber
                          ? 'border-rose-400 focus:ring-rose-500'
                          : 'border-slate-300 focus:ring-blue-600'
                      }`}
                    />
                  </div>
                  {touched.rationCardNumber && errors.rationCardNumber ? (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      {errors.rationCardNumber}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Must be exactly 12 numeric digits (digits only). Verified securely on submission.
                    </p>
                  )}
                </div>
              )}

              {/* SHOP OWNER SPECIFIC FIELDS */}
              {role === 'SHOP_OWNER' && (
                <>
                  {/* Fair Price Shop ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Fair Price Shop ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="fpsCode"
                        value={formData.fpsCode}
                        onChange={handleChange}
                        onBlur={() => handleBlur('fpsCode')}
                        placeholder="e.g. FPS-TN-04-001 or New Shop ID"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl font-mono uppercase text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 transition ${
                          touched.fpsCode && errors.fpsCode
                            ? 'border-rose-400 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-emerald-600'
                        }`}
                      />
                    </div>
                    {touched.fpsCode && errors.fpsCode && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {errors.fpsCode}
                      </p>
                    )}
                  </div>

                  {/* Shop Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Shop Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('shopName')}
                        placeholder="e.g. Anna Nagar Fair Price Shop #1"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 transition ${
                          touched.shopName && errors.shopName
                            ? 'border-rose-400 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-emerald-600'
                        }`}
                      />
                    </div>
                    {touched.shopName && errors.shopName && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {errors.shopName}
                      </p>
                    )}
                  </div>

                  {/* Shop Address */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Shop Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="shopAddress"
                        value={formData.shopAddress}
                        onChange={handleChange}
                        onBlur={() => handleBlur('shopAddress')}
                        placeholder="Street, area, taluk, and city address"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 transition ${
                          touched.shopAddress && errors.shopAddress
                            ? 'border-rose-400 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-emerald-600'
                        }`}
                      />
                    </div>
                    {touched.shopAddress && errors.shopAddress && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {errors.shopAddress}
                      </p>
                    )}
                  </div>

                  {/* Shop Owner Approval Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Notice:</strong> New Fair Price Shop Owner accounts will remain pending
                      until authorized by a Civil Supplies Administrator.
                    </span>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Minimum 8 characters"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 transition ${
                      touched.password && errors.password
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className="font-bold text-slate-700">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {touched.password && errors.password && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 transition ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  } ${
                    role === 'BENEFICIARY'
                      ? 'bg-blue-700 hover:bg-blue-600'
                      : 'bg-emerald-700 hover:bg-emerald-600'
                  }`}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {role === 'BENEFICIARY'
                          ? 'Register Citizen Account'
                          : 'Submit Shop Owner Registration'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer link to sign in */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have a registered account?{' '}
            <Link to="/login" className="text-blue-700 font-bold hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
