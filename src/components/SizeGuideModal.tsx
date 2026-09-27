import React, { useState } from 'react';
import { X, Ruler, Sparkles, Check, HelpCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  language: 'bn' | 'en';
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category = 'fashion',
  language
}) => {
  if (!isOpen) return null;

  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeTab, setActiveTab] = useState<'panjabi' | 'tshirt' | 'shoes'>('panjabi');

  const panjabiSizes = [
    { size: '38 (M)', chest: '40', chestCm: '101.6', length: '40', lengthCm: '101.6', shoulder: '17.5', shoulderCm: '44.5' },
    { size: '40 (L)', chest: '42', chestCm: '106.7', length: '42', lengthCm: '106.7', shoulder: '18.0', shoulderCm: '45.7' },
    { size: '42 (XL)', chest: '44', chestCm: '111.8', length: '44', lengthCm: '111.8', shoulder: '18.5', shoulderCm: '47.0' },
    { size: '44 (XXL)', chest: '46', chestCm: '116.8', length: '46', lengthCm: '116.8', shoulder: '19.0', shoulderCm: '48.3' }
  ];

  const tshirtSizes = [
    { size: 'M', chest: '38', chestCm: '96.5', length: '27', lengthCm: '68.5', sleeve: '8', sleeveCm: '20.3' },
    { size: 'L', chest: '40', chestCm: '101.6', length: '28', lengthCm: '71.1', sleeve: '8.5', sleeveCm: '21.5' },
    { size: 'XL', chest: '42', chestCm: '106.7', length: '29', lengthCm: '73.6', sleeve: '9', sleeveCm: '22.8' },
    { size: 'XXL', chest: '44', chestCm: '111.8', length: '30', lengthCm: '76.2', sleeve: '9.5', sleeveCm: '24.1' }
  ];

  const shoeSizes = [
    { eu: '40', uk: '6', bd: '6', cm: '25.0', in: '9.8' },
    { eu: '41', uk: '7', bd: '7', cm: '25.5', in: '10.0' },
    { eu: '42', uk: '8', bd: '8', cm: '26.0', in: '10.2' },
    { eu: '43', uk: '9', bd: '9', cm: '27.0', in: '10.6' },
    { eu: '44', uk: '10', bd: '10', cm: '28.0', in: '11.0' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area-modal-overlay backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col my-auto border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a3871] to-[#f85606] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-yellow-300">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {language === 'bn' ? 'সঠিক সাইজ মেজারমেন্ট গাইড' : 'Size Chart & Fitting Guide'}
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' ? 'আপনার সঠিক সাইজ বেছে নিন' : 'Find your perfect size accurately'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-850/50 shrink-0">
          <div className="flex gap-1.5 bg-gray-200/70 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('panjabi')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'panjabi' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {language === 'bn' ? 'পাঞ্জাবি' : 'Panjabi'}
            </button>
            <button
              onClick={() => setActiveTab('tshirt')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'tshirt' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {language === 'bn' ? 'টি-শার্ট' : 'T-Shirt'}
            </button>
            <button
              onClick={() => setActiveTab('shoes')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'shoes' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {language === 'bn' ? 'জুতো' : 'Footwear'}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => setUnit('inches')}
              className={`px-2 py-0.5 rounded cursor-pointer ${unit === 'inches' ? 'bg-[#f85606] text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-2 py-0.5 rounded cursor-pointer ${unit === 'cm' ? 'bg-[#f85606] text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Chart Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 text-xs pb-20 sm:pb-4">
          {activeTab === 'panjabi' && (
            <div className="border border-gray-200 dark:border-gray-750 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-orange-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold border-b border-gray-200 dark:border-gray-700 text-[11px]">
                    <th className="p-2.5">Size (সাইজ)</th>
                    <th className="p-2.5">Chest ({unit})</th>
                    <th className="p-2.5">Length ({unit})</th>
                    <th className="p-2.5">Shoulder ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {panjabiSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/60 font-medium text-gray-700 dark:text-gray-300">
                      <td className="p-2.5 font-bold text-gray-900 dark:text-gray-100">{row.size}</td>
                      <td className="p-2.5">{unit === 'inches' ? row.chest : row.chestCm}</td>
                      <td className="p-2.5">{unit === 'inches' ? row.length : row.lengthCm}</td>
                      <td className="p-2.5">{unit === 'inches' ? row.shoulder : row.shoulderCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tshirt' && (
            <div className="border border-gray-200 dark:border-gray-750 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-orange-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold border-b border-gray-200 dark:border-gray-700 text-[11px]">
                    <th className="p-2.5">Size (সাইজ)</th>
                    <th className="p-2.5">Chest ({unit})</th>
                    <th className="p-2.5">Length ({unit})</th>
                    <th className="p-2.5">Sleeve ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tshirtSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/60 font-medium text-gray-700 dark:text-gray-300">
                      <td className="p-2.5 font-bold text-gray-900 dark:text-gray-100">{row.size}</td>
                      <td className="p-2.5">{unit === 'inches' ? row.chest : row.chestCm}</td>
                      <td className="p-2.5">{unit === 'inches' ? row.length : row.lengthCm}</td>
                      <td className="p-2.5">{unit === 'inches' ? row.sleeve : row.sleeveCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shoes' && (
            <div className="border border-gray-200 dark:border-gray-750 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-orange-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold border-b border-gray-200 dark:border-gray-700 text-[11px]">
                    <th className="p-2.5">EU Size</th>
                    <th className="p-2.5">UK / BD Size</th>
                    <th className="p-2.5">Foot Length ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {shoeSizes.map((row) => (
                    <tr key={row.eu} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/60 font-medium text-gray-700 dark:text-gray-300">
                      <td className="p-2.5 font-bold text-gray-900 dark:text-gray-100">{row.eu}</td>
                      <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">{row.bd}</td>
                      <td className="p-2.5">{unit === 'inches' ? `${row.in}"` : `${row.cm} cm`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl p-3 flex items-start gap-2.5 text-blue-900 dark:text-blue-300 text-[11px]">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">
                {language === 'bn' ? 'কীভাবে মাপ নেবেন?' : 'How to Measure?'}
              </strong>
              <span>
                {language === 'bn'
                  ? 'আপনার বুকের সবচেয়ে চওড়া অংশে ফিতা দিয়ে মেপে চার্টের সাথে মিলিয়ে নিন। কোনো সাইজ নিয়ে দ্বিধা থাকলে ১ সাইজ বড় অর্ডার করার পরামর্শ দেওয়া হয়।'
                  : 'Measure around the fullest part of your chest. If in doubt between two sizes, we recommend picking the larger size.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 dark:bg-gray-700 text-white font-bold text-xs rounded-xl hover:bg-black dark:hover:bg-gray-600 transition cursor-pointer"
          >
            {language === 'bn' ? 'বুঝেছি' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
