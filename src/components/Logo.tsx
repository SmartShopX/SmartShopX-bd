import React from 'react';
import logoImg from '../assets/images/smartshopx_logo_1790128427322.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]', tag: 'text-[9px]' },
    md: { img: 'w-9 h-9 sm:w-11 sm:h-11', text: 'text-lg sm:text-xl', sub: 'text-[10px]', tag: 'text-[10px]' },
    lg: { img: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs', tag: 'text-xs' },
    xl: { img: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm', tag: 'text-sm' }
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* High-res Rainbow Ring Badge Logo */}
      <div className={`relative ${current.img} shrink-0 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-yellow-400 via-orange-500 to-emerald-500 shadow-xs group-hover:scale-105 transition duration-200`}>
        <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center">
          <img
            src={logoImg}
            alt="SmartShopX.bd Logo"
            className="w-full h-full object-cover rounded-full"
            loading="eager"
          />
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-0.5 leading-tight">
            <span className={`font-black tracking-tight text-[#0a3871] dark:text-white ${current.text}`}>
              SmartShop<span className="bg-gradient-to-r from-[#f85606] via-[#ff2a00] to-[#00a8ff] bg-clip-text text-transparent">X</span>
            </span>
            <span className={`font-extrabold text-[#00a8ff] ${current.tag}`}>
              .bd
            </span>
          </div>
          <p className={`font-semibold text-gray-500 dark:text-gray-400 tracking-tight leading-none mt-0.5 ${current.sub}`}>
            Smart Choice, Better Life
          </p>
        </div>
      )}
    </div>
  );
};
