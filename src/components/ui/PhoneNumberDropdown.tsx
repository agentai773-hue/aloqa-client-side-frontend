'use client';

import React from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { usePhoneNumberOptions } from '../../hooks/usePhoneNumbers';
import { AloqaInlineLoader } from '../loaders';

interface PhoneNumberDropdownProps {
  value?: string;
  onChange: (phoneNumberId: string, phoneNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCountryFlag?: boolean;
}

export const PhoneNumberDropdown: React.FC<PhoneNumberDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select a phone number",
  disabled = false,
  className = "",
  showCountryFlag = true,
}) => {
  const { options: phoneNumberOptions, isLoading, error, phoneNumbers } = usePhoneNumberOptions();
  const hasPhoneNumbers = phoneNumbers && phoneNumbers.length > 0;

  const selectedOption = phoneNumberOptions.find(option => option.value === value);

  const getCountryFlag = (country: string) => {
    return country === 'US' ? '🇺🇸' : country === 'IN' ? '🇮🇳' : '🌐';
  };

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
          <AloqaInlineLoader text="Loading phone numbers..." size="sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-3 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
          Error loading phone numbers. Please try again.
        </div>
      </div>
    );
  }

  if (!hasPhoneNumbers) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>No phone numbers assigned. Please contact admin.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => {
          const selectedId = e.target.value;
          const selectedPhone = phoneNumberOptions.find(opt => opt.value === selectedId);
          if (selectedPhone) {
            onChange(selectedId, selectedPhone.phone);
          }
        }}
        disabled={disabled}
        className={`
          w-full px-4 py-3 pr-10 border rounded-lg appearance-none cursor-pointer
          focus:ring-2 focus:ring-[#34DB17] focus:border-[#34DB17] outline-none
          transition-colors duration-200
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'}
          ${value ? 'text-gray-900' : 'text-gray-500'}
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {phoneNumberOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {showCountryFlag && `${getCountryFlag(option.country)} `}
            {option.phone} ({option.country})
          </option>
        ))}
      </select>
      
      {/* Custom dropdown icon */}
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
      
      {/* Display selected phone number info */}
      {selectedOption && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Phone className="w-3 h-3" />
            <span>
              {showCountryFlag && `${getCountryFlag(selectedOption.country)} `}
              {selectedOption.phone}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberDropdown;