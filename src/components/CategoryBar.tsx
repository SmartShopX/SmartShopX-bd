import React from 'react';
import { Category } from '../types';
import {
  Smartphone,
  Shirt,
  Sparkles,
  Home,
  Laptop,
  ShoppingBag,
  Grid,
  ShieldCheck,
  Truck
} from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  language: 'bn' | 'en';
  filterDarazMall: boolean;
  setFilterDarazMall: (val: boolean) => void;
  filterFreeDelivery: boolean;
  setFilterFreeDelivery: (val: boolean) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  language,
  filterDarazMall,
  setFilterDarazMall,
  filterFreeDelivery,
  setFilterFreeDelivery
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Grid className="w-4 h-4" />;
    }
  };

  return (
    <div id="category-section" className="bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-4 shadow-2xs border border-gray-100 dark:border-gray-800 mb-4 sm:mb-6 transition-colors scroll-mt-28">
      {/* Category Row */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 mb-2.5 sm:mb-3 pb-2.5 sm:pb-3 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xs sm:text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f85606]" />
          <span>{language === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}</span>
        </h2>

        {/* Filter toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setFilterDarazMall(!filterDarazMall)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold transition cursor-pointer ${
              filterDarazMall
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{language === 'bn' ? 'স্মার্টমল' : 'SmartMall'}</span>
          </button>

          <button
            onClick={() => setFilterFreeDelivery(!filterFreeDelivery)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold transition cursor-pointer ${
              filterFreeDelivery
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{language === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free Shipping'}</span>
          </button>
        </div>
      </div>

      {/* Category list items */}
      <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#f85606] text-white shadow-sm'
              : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{language === 'bn' ? 'সব পণ্য' : 'All Products'}</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition cursor-pointer ${
                isSelected
                  ? 'bg-[#f85606] text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span
                className={`${
                  isSelected ? 'text-white' : 'text-[#f85606] dark:text-orange-400'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
              </span>
              <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
