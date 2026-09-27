import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Gift,
  ArrowRight,
  LogIn,
  UserPlus,
  KeyRound,
  MapPin
} from 'lucide-react';
import { CustomerSession } from '../types';
import { BANGLADESH_DIVISIONS } from '../data/mockProducts';
import { AuthService } from '../services/marketplaceService';
import { StorageService, INITIAL_MOCK_USERS } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  onAuthSuccess: (session: CustomerSession, isNewUser?: boolean) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('01712345678');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form states
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDivision, setRegDivision] = useState('dhaka');
  const [regCity, setRegCity] = useState('Dhaka - North');
  const [regZone, setRegZone] = useState('Gulshan / Banani');
  const [regAddress, setRegAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password form states
  const [forgotPhone, setForgotPhone] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে মোবাইল নম্বর বা ইমেইল লিখুন।'
          : 'Please enter your mobile phone number or email.'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMessage(
        language === 'bn' ? 'অনুগ্রহ করে পাসওয়ার্ড লিখুন।' : 'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.login({
        phone: loginIdentifier.includes('@') ? undefined : loginIdentifier,
        email: loginIdentifier.includes('@') ? loginIdentifier : undefined,
        password: loginPassword
      });

      if (res.success && res.session) {
        onAuthSuccess(res.session, false);
        onClose();
      } else {
        setErrorMessage(language === 'bn' ? res.messageBn : res.message);
      }
    } catch {
      setErrorMessage(
        language === 'bn' ? 'লগইন করতে সমস্যা হয়েছে।' : 'Failed to login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage(language === 'bn' ? 'পুরো নাম আবশ্যক।' : 'Full name is required.');
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage(
        language === 'bn'
          ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।'
          : 'Please enter a valid 11-digit Bangladesh phone number.'
      );
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(
        language === 'bn' ? 'উভয় পাসওয়ার্ড মিলছে না।' : 'Passwords do not match.'
      );
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(
        language === 'bn'
          ? 'শর্তাবলী মেনে নেওয়া আবশ্যক।'
          : 'You must agree to the Terms & Conditions.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.register({
        fullName: regFullName.trim(),
        phone: cleanPhone,
        email: regEmail.trim() || undefined,
        password: regPassword,
        division: regDivision,
        city: regCity,
        zone: regZone,
        addressDetails: regAddress.trim() || 'House 42, Road 11'
      });

      if (res.success && res.session) {
        onAuthSuccess(res.session, true);
        onClose();
      } else {
        setErrorMessage(language === 'bn' ? res.messageBn : res.message);
      }
    } catch {
      setErrorMessage(
        language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' : 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (user: (typeof INITIAL_MOCK_USERS)[0]) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthService.login({
        phone: user.phone,
        password: user.password,
        isDemo: true
      });
      if (res.success && res.session) {
        onAuthSuccess(res.session, false);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!forgotPhone.trim()) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে রেজিস্টার্ড মোবাইল নম্বর লিখুন।'
          : 'Please enter your registered phone number.'
      );
      return;
    }

    if (!resetOtpSent) {
      setResetOtpSent(true);
      setSuccessMessage(
        language === 'bn'
          ? '📩 আপনার মোবাইলে ৪ ডিজিটের ওটিপি পাঠানো হয়েছে (ডেমো কোড: ১২৩৪)'
          : '📩 A 4-digit verification code has been sent (Demo Code: 1234)'
      );
      return;
    }

    if (resetOtp !== '1234' && resetOtp.length < 4) {
      setErrorMessage(
        language === 'bn' ? 'সঠিক ওটিপি কোড লিখুন (১২৩৪)' : 'Please enter valid OTP (1234)'
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        language === 'bn'
          ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'New password must be at least 6 characters.'
      );
      return;
    }

    const res = StorageService.resetPasswordByPhone(forgotPhone, newPassword);
    if (res.success) {
      setSuccessMessage(language === 'bn' ? res.messageBn : res.message);
      setTimeout(() => {
        setMode('login');
        setLoginIdentifier(forgotPhone);
        setLoginPassword(newPassword);
        setResetOtpSent(false);
        setSuccessMessage(null);
      }, 1500);
    } else {
      setErrorMessage(language === 'bn' ? res.messageBn : res.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent dark:from-orange-950/50 dark:via-gray-850 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f85606] to-amber-500 text-white flex items-center justify-center shadow-md">
              {mode === 'register' ? (
                <UserPlus className="w-5 h-5" />
              ) : mode === 'forgot_password' ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 leading-tight">
                {mode === 'register'
                  ? language === 'bn'
                    ? 'নতুন গ্রাহক অ্যাকাউন্ট খুলুন'
                    : 'Create Customer Account'
                  : mode === 'forgot_password'
                  ? language === 'bn'
                    ? 'পাসওয়ার্ড রিসেট করুন'
                    : 'Reset Password'
                  : language === 'bn'
                  ? 'গ্রাহক অ্যাকাউন্টে লগইন'
                  : 'Customer Account Login'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mode === 'register'
                  ? language === 'bn'
                    ? 'রেজিস্ট্রেশন করলেই পাচ্ছেন ৫০ বোনাস কয়েন!'
                    : 'Get 50 bonus SmartCoins on sign up!'
                  : mode === 'forgot_password'
                  ? language === 'bn'
                    ? 'মোবাইল নম্বরে ওটিপি দিয়ে পাসওয়ার্ড পরিবর্তন করুন'
                    : 'Verify your phone to set a new password'
                  : language === 'bn'
                  ? 'স্মার্টশপএক্স-এ কেনাকাটা ও ট্র্যাক করতে সাইন ইন করুন'
                  : 'Sign in to access orders, coins & wishlist'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1.5 mx-4 sm:mx-6 mt-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-750 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white dark:bg-gray-700 text-[#f85606] dark:text-orange-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white dark:bg-gray-700 text-[#f85606] dark:text-orange-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন রেজিস্ট্রেশন' : 'Register'}</span>
              <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                +50
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Error Message Box */}
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
              <span className="shrink-0 text-red-500">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {language === 'bn' ? 'মোবাইল নম্বর অথবা ইমেইল' : 'Mobile Phone or Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={
                      language === 'bn' ? '০১৭XXXXXXXX বা ইমেইল' : '01712345678 or email'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setForgotPhone(loginIdentifier.replace(/\D/g, '') || '01712345678');
                    }}
                    className="text-xs font-bold text-[#f85606] hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#f85606] focus:ring-[#f85606]"
                  />
                  <span>{language === 'bn' ? 'আমাকে মনে রাখুন' : 'Remember Me'}</span>
                </label>
                <span className="text-gray-400 text-[11px]">
                  {language === 'bn' ? 'সুরক্ষিত SSL এনক্রিপশন' : 'Secured with 256-bit SSL'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#f85606] hover:bg-[#d84a05] text-white text-sm font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In to Account'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Reward Callout Banner */}
              <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 p-3 rounded-2xl border border-orange-200 dark:border-orange-900/40 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-snug">
                  <div className="font-extrabold text-[#f85606] dark:text-orange-400">
                    {language === 'bn' ? '🎉 নতুন মেম্বার বোনাস' : '🎉 New Shopper Gift'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {language === 'bn'
                      ? 'অ্যাকাউন্ট খুললেই +৫০ স্মার্টকয়েন ও ফ্রি ডেলিভারি কুপন জমা হবে।'
                      : '+50 SmartCoins & Free Delivery voucher added upon registration.'}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'bn' ? 'পুরো নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার নাম' : 'Your full name'}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                  />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'Password (min 6 chars) *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Delivery Address Location Setup */}
              <div className="bg-gray-50 dark:bg-gray-850 p-3 rounded-2xl border border-gray-200/80 dark:border-gray-750 space-y-2">
                <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#f85606]" />
                  <span>{language === 'bn' ? 'প্রাথমিক ডেলিভারি এলাকা' : 'Initial Delivery Area'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={regDivision}
                    onChange={(e) => {
                      setRegDivision(e.target.value);
                      const div = BANGLADESH_DIVISIONS.find((d) => d.id === e.target.value);
                      if (div) {
                        setRegCity(div.name);
                      }
                    }}
                    className="py-1.5 px-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {language === 'bn' ? d.nameBn : d.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={regZone}
                    onChange={(e) => setRegZone(e.target.value)}
                    placeholder={language === 'bn' ? 'থানা / এরিয়া' : 'Area / Thana'}
                    className="py-1.5 px-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1 text-xs">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#f85606] focus:ring-[#f85606]"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-gray-600 dark:text-gray-400 cursor-pointer text-[11px]"
                >
                  {language === 'bn'
                    ? 'আমি স্মার্টশপএক্স এর ব্যবহারের শর্তাবলী ও প্রাইভেসি পলিসিতে সম্মতি জানাচ্ছি।'
                    : 'I agree to the SmartShopX Terms of Service and Privacy Policy.'}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#f85606] hover:bg-[#d84a05] text-white text-sm font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {language === 'bn'
                        ? 'অ্যাকাউন্ট খুলুন ও +৫০ কয়েন নিন'
                        : 'Create Account & Claim +50 Coins'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {language === 'bn' ? 'রেজিস্টার্ড মোবাইল নম্বর' : 'Registered Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                  />
                </div>
              </div>

              {resetOtpSent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      {language === 'bn' ? '৪ ডিজিটের ওটিপি কোড (১২৩৪)' : '4-Digit OTP Code (1234)'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="1234"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-sm font-black text-center tracking-widest text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-[#f85606]"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#f85606] hover:bg-[#d84a05] text-white text-sm font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {resetOtpSent
                    ? language === 'bn'
                      ? 'পাসওয়ার্ড নিশ্চিত করুন'
                      : 'Set New Password'
                    : language === 'bn'
                    ? 'ওটিপি কোড পাঠান'
                    : 'Send Verification OTP'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer"
              >
                {language === 'bn' ? '← লগইন স্ক্রিনে ফিরে যান' : '← Back to Login'}
              </button>
            </form>
          )}

          {/* QUICK 1-CLICK DEMO ACCOUNT SELECTOR */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
              <span>{language === 'bn' ? '⚡ দ্রুত টেস্ট অ্যাকাউন্ট' : '⚡ 1-Click Demo Accounts'}</span>
              <span className="text-[9px] text-[#f85606] font-bold">One-Click Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {INITIAL_MOCK_USERS.map((usr) => (
                <button
                  key={usr.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(usr)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-750 hover:border-orange-500 bg-gray-50/70 dark:bg-gray-800/70 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#f85606]">
                      {language === 'bn' ? usr.fullName : usr.displayName}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>{usr.membershipLevel}</span>
                    <span>🪙 {usr.coins}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
