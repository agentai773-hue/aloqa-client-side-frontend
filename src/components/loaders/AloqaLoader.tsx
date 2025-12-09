'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface AloqaLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
  showText?: boolean;
  text?: string;
  className?: string;
}

export const AloqaLoader: React.FC<AloqaLoaderProps> = ({ 
  size = 'md',
  showLogo = true,
  showText = true,
  text = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      logo: 'w-12 h-12 md:w-16 md:h-16', // Responsive sizes
      logoSize: { mobile: 48, desktop: 64 },
      text: 'text-xs md:text-sm',
      spacing: 'gap-3 md:gap-4'
    },
    md: {
      logo: 'w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24', // Responsive sizes
      logoSize: { mobile: 64, desktop: 96 },
      text: 'text-sm md:text-base',
      spacing: 'gap-4 md:gap-5'
    },
    lg: {
      logo: 'w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32', // Responsive sizes
      logoSize: { mobile: 80, desktop: 128 },
      text: 'text-base md:text-lg',
      spacing: 'gap-5 md:gap-6'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${currentSize.spacing} ${className}`}>
      {/* Static Logo - Fixed Position, Responsive */}
      {showLogo && (
        <div className="shrink-0">
          <Image
            src="/black-logo.svg"
            alt="Aloqa AI"
            width={currentSize.logoSize.desktop}
            height={currentSize.logoSize.desktop}
            className={`${currentSize.logo} object-contain mx-auto`}
            priority
            style={{ 
              animation: 'none',
              display: 'block'
            }}
          />
        </div>
      )}

      {/* Loading Progress Bars - Fixed Position */}
      <div className="flex items-end justify-center space-x-1 py-2">
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <motion.div
            key={index}
            className={`w-1 md:w-1.5 rounded-sm ${
              index % 2 === 0 ? 'bg-[#34DB17]' : 'bg-[#306B25]'
            }`}
            initial={{ height: 4 }}
            animate={{ 
              height: [4, 24, 4]
            }}
            transition={{
              duration: 1.0,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              delay: index * 0.08,
              repeatDelay: 0.1
            }}
          />
        ))}
      </div>

      {/* Loading Text - Fixed Position */}
      {showText && text && text !== 'Welcome to Aloqa AI...' && (
        <div className="shrink-0 text-center">
          <p className={`text-[#306B25] font-medium ${currentSize.text} whitespace-nowrap`}>
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

// Full screen loader component - Responsive & Fixed Position
export const AloqaFullScreenLoader: React.FC<{
  text?: string;
}> = ({ 
  text = 'Loading...'
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-4 md:gap-6 p-4">
        
        {/* Static Logo - Responsive, Fixed Position */}
        <div className="shrink-0">
          <Image
            src="/black-logo.svg"
            alt="Aloqa AI"
            width={160}
            height={160}
            className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain mx-auto"
            priority
            style={{ 
              animation: 'none',
              display: 'block'
            }}
          />
        </div>

        {/* Loading Progress Bars - Responsive, Fixed Position */}
        <div className="flex items-end justify-center space-x-1 md:space-x-1.5 py-2">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <motion.div
              key={index}
              className={`w-1.5 md:w-2 rounded-sm ${
                index % 2 === 0 ? 'bg-[#34DB17]' : 'bg-[#306B25]'
              }`}
              initial={{ height: 6 }}
              animate={{ 
                height: [6, 36, 6]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: [0.4, 0, 0.2, 1],
                delay: index * 0.08,
                repeatDelay: 0.1
              }}
            />
          ))}
        </div>

        {/* Loading Text - Responsive, Fixed Position */}
        {text && text !== 'Welcome to Aloqa AI...' && (
          <div className="shrink-0 text-center">
            <p className="text-[#306B25] text-sm md:text-base font-medium whitespace-nowrap">
              {text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact inline loader - Responsive & Fixed Position
export const AloqaInlineLoader: React.FC<{
  text?: string;
  size?: 'sm' | 'md';
  barColor?: string;
  textColor?: string;
}> = ({ text = 'Loading...', size = 'sm', barColor = '#34DB17', textColor = '#306B25' }) => {
  const altBarColor = barColor === '#34DB17' ? '#306B25' : barColor;
  
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 py-2 md:py-4 px-2">
      <div className="flex items-end justify-center space-x-0.5 md:space-x-1 shrink-0">
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <motion.div
            key={index}
            className="w-0.5 md:w-1 rounded-sm"
            style={{ backgroundColor: index % 2 === 0 ? barColor : altBarColor }}
            initial={{ height: 2 }}
            animate={{ 
              height: [2, 16, 2]
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              delay: index * 0.06,
              repeatDelay: 0.1
            }}
          />
        ))}
      </div>
      {text && text !== 'Welcome to Aloqa AI...' && (
        <span className={`font-medium shrink-0 whitespace-nowrap ${size === 'sm' ? 'text-xs md:text-sm' : 'text-sm md:text-base'}`} style={{ color: textColor }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default AloqaLoader;