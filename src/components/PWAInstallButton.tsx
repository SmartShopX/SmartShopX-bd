import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallProps {
  language: 'bn' | 'en';
}

export const PWAInstallButton: React.FC<PWAInstallProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/15 text-green-700 text-xs font-semibold rounded-full border border-green-500/30">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
        <span>{language === 'bn' ? 'অ্যাপ ইনস্টলড' : 'App Installed'}</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-sm shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>{language === 'bn' ? 'দারাজ অ্যাপ ইনস্টল' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 font-medium text-xs px-3 py-1 rounded-full transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'iOS এ ইনস্টল' : 'Install iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-[#212121]">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    D
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {language === 'bn' ? 'আইফোন / আইপ্যাডে ইনস্টল করুন' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3 p-2.5 bg-orange-50/70 rounded-xl border border-orange-100">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ১
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {language === 'bn' ? 'Safari ব্রাউজারের নিচে Share বোতামে চাপুন' : 'Tap the Share button in Safari'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Share2 className="w-3.5 h-3.5 text-blue-500 inline" />{' '}
                      {language === 'bn' ? 'শেয়ার আইকনটি খুঁজুন' : 'Look for the share square icon'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-orange-50/70 rounded-xl border border-orange-100">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ২
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {language === 'bn' ? 'মেনু থেকে Add to Home Screen নির্বাচন করুন' : 'Select "Add to Home Screen"'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <PlusSquare className="w-3.5 h-3.5 text-gray-700 inline" />{' '}
                      {language === 'bn' ? 'হোম স্ক্রিনে আইকন যুক্ত হবে' : 'Adds Daraz app icon to your home screen'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition shadow-sm"
              >
                {language === 'bn' ? 'বুঝতে পেরেছি' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback trigger
  return (
    <button
      onClick={() => {
        alert(
          language === 'bn'
            ? 'ব্রাউজার মেনু থেকে "Install App" বা "Add to Home Screen" নির্বাচন করে দারাজ অ্যাপটি দ্রুত ব্যবহার করুন।'
            : 'Select "Install App" or "Add to Home Screen" from your browser settings menu to install.'
        );
      }}
      className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 font-medium text-xs px-3 py-1 rounded-full transition"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{language === 'bn' ? 'অ্যাপ নামান' : 'Get App'}</span>
    </button>
  );
};

export const PWAInstallBanner: React.FC<PWAInstallProps> = ({ language }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#f85606] via-[#ff6819] to-[#ea4c00] text-white px-4 py-2.5 text-xs sm:text-sm shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 font-bold text-white">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">
              {language === 'bn'
                ? '⚡ দারাজ অ্যাপ ইন্সটল করুন — অফলাইনেও কেনাকাটার সেরা অভিজ্ঞতা!'
                : '⚡ Install Daraz App — Fast offline shopping & instant sync!'}
            </p>
            <p className="text-[11px] text-white/80 hidden sm:block">
              {language === 'bn'
                ? 'ইন্টারনেট না থাকলেও পণ্য দেখুন ও অর্ডার রাখুন, সংযোগ পেলে স্বয়ংক্রিয় সিঙ্ক হবে।'
                : 'Browse products & queue orders even with no internet connection.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition active:scale-95"
          >
            {language === 'bn' ? 'এখনই ইনস্টল' : 'Install Now'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-white/70 hover:text-white rounded-md hover:bg-white/10"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
