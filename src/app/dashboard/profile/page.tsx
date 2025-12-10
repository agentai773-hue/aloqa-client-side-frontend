'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Phone, 
  Building, 
  Edit, 
  Save, 
  X, 
  Camera,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react';

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    companyName: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        companyName: user.companyName || '',
      });
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the profile
    setIsEditing(false);
    // Show success message
  };

  const getStatusBadge = () => {
    if (user?.isApproval === 1) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4 mr-1" />
          Pending Approval
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image 
                    src={profileImage} 
                    alt="Profile" 
                    width={96}
                    height={96}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-white text-indigo-600 rounded-full p-2 hover:bg-gray-50 transition-colors shadow-lg"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User Profile'}
              </h1>
              <p className="text-indigo-100 text-lg">{user?.email || 'user@example.com'}</p>
              <div className="mt-2">
                {getStatusBadge()}
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <UserCheck className="w-6 h-6 text-indigo-600 mr-2" />
            Personal Information
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{user?.firstName || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{user?.lastName || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{user?.email || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{user?.mobile || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{user?.companyName || 'Not provided'}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Account Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-linear-to-r from-green-50 to-emerald-100 px-6 py-4 border-b border-green-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 text-green-600 mr-2" />
            Account Details
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Role */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">User Role</p>
                <p className="text-lg font-semibold text-blue-700 capitalize">{user?.role || 'User'}</p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <p className="text-lg font-semibold text-green-700">
                  {user?.isApproval === 1 ? 'Approved' : 'Pending Approval'}
                </p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Calendar className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Login</p>
                <p className="text-lg font-semibold text-purple-700">
                  Recently Active
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <User className="h-6 w-6 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="text-sm font-mono text-gray-700 break-all">{user?._id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-linear-to-r from-red-50 to-pink-100 px-6 py-4 border-b border-red-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 text-red-600 mr-2" />
            Security & Settings
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <button className="w-full text-left p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <Edit className="w-5 h-5 text-gray-400" />
            </div>
          </button>
          
          <button className="w-full text-left p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently delete your account and data</p>
              </div>
              <X className="w-5 h-5 text-red-500" />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}