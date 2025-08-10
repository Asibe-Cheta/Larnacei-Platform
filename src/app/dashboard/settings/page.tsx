'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Shield, 
  Upload, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  Camera,
  FileText,
  CreditCard,
  Bell,
  Lock,
  Settings as SettingsIcon
} from 'lucide-react';

interface VerificationDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  documentNumber?: string;
  verificationStatus: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  bio: string;
  role: string;
  accountType: string;
  isVerified: boolean;
  phoneVerified: boolean;
  verificationLevel: string;
  contactPreference: string;
  smsNotifications: boolean;
  profileVisibility: boolean;
  showContactInfo: boolean;
  verificationDocs: VerificationDocument[];
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    phone: '',
    bio: '',
    image: '',
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [preferences, setPreferences] = useState({
    contactPreference: 'EMAIL',
    smsNotifications: false,
    profileVisibility: false,
    showContactInfo: false,
  });

  const [documents, setDocuments] = useState({
    nin: { file: null as File | null, number: '' },
    bvn: { file: null as File | null, number: '' },
    driversLicense: { file: null as File | null, number: '' },
    passport: { file: null as File | null, number: '' },
  });

  // Status messages
  const [status, setStatus] = useState<{ [key: string]: { type: 'success' | 'error' | 'info'; message: string } | null }>({
    profile: null,
    password: null,
    phone: null,
    documents: null,
    preferences: null,
  });

  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({
    profile: false,
    password: false,
    phone: false,
    documents: false,
    preferences: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      if (data.success) {
        const userData = data.data;
        setUser(userData);
        setPersonalInfo({
          name: userData.name || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          image: userData.image || '',
        });
        setPreferences({
          contactPreference: userData.contactPreference || 'EMAIL',
          smsNotifications: userData.smsNotifications || false,
          profileVisibility: userData.profileVisibility || false,
          showContactInfo: userData.showContactInfo || false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (section: string, type: 'success' | 'error' | 'info', message: string) => {
    setStatus(prev => ({ ...prev, [section]: { type, message } }));
    setTimeout(() => setStatus(prev => ({ ...prev, [section]: null })), 5000);
  };

  const updateLoadingState = (section: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [section]: loading }));
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        updateStatus('profile', 'error', 'Profile picture must be less than 5MB');
        return;
      }
      setProfilePicFile(file);
      setPersonalInfo(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handlePersonalInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateLoadingState('profile', true);
    try {
      let imageUrl = personalInfo.image;
      
      // Upload profile picture if changed
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('images', profilePicFile);
        
        const uploadRes = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.urls.length > 0) {
            imageUrl = uploadData.urls[0];
          }
        }
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personalInfo.name,
          phone: personalInfo.phone,
          bio: personalInfo.bio,
          image: imageUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateStatus('profile', 'success', 'Profile updated successfully!');
        setUser(prev => prev ? { ...prev, ...data.data } : null);
        setProfilePicFile(null);
      } else {
        updateStatus('profile', 'error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      updateStatus('profile', 'error', 'An error occurred while updating profile');
    } finally {
      updateLoadingState('profile', false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      updateStatus('password', 'error', 'New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      updateStatus('password', 'error', 'Password must be at least 8 characters');
      return;
    }

    updateLoadingState('password', true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateStatus('password', 'success', 'Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        updateStatus('password', 'error', data.error || 'Failed to change password');
      }
    } catch (error) {
      updateStatus('password', 'error', 'An error occurred while changing password');
    } finally {
      updateLoadingState('password', false);
    }
  };

  const handlePhoneVerify = async () => {
    updateLoadingState('phone', true);
    try {
      const res = await fetch('/api/sms/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: personalInfo.phone }),
      });

      const data = await res.json();
      if (data.message) {
        updateStatus('phone', 'success', 'Verification code sent to your phone');
      } else {
        updateStatus('phone', 'error', data.error || 'Failed to send verification code');
      }
    } catch (error) {
      updateStatus('phone', 'error', 'Failed to send verification code');
    } finally {
      updateLoadingState('phone', false);
    }
  };

  const handleDocumentChange = (docType: string, field: 'file' | 'number', value: any) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType as keyof typeof prev], [field]: value }
    }));
  };

  const handleDocumentUpload = async (docType: string) => {
    const doc = documents[docType as keyof typeof documents];
    if (!doc.file || !doc.number) {
      updateStatus('documents', 'error', 'Please provide both document file and number');
      return;
    }

    updateLoadingState('documents', true);
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('images', doc.file);
      
      const uploadRes = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload document');
      }

      const uploadData = await uploadRes.json();
      if (!uploadData.success || !uploadData.urls.length) {
        throw new Error('Failed to get document URL');
      }

      // Then save document info
      const res = await fetch('/api/users/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: docType.toUpperCase(),
          documentUrl: uploadData.urls[0],
          documentNumber: doc.number,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateStatus('documents', 'success', `${docType.toUpperCase()} document uploaded successfully!`);
        fetchProfile(); // Refresh to get updated documents
        setDocuments(prev => ({
          ...prev,
          [docType]: { file: null, number: '' }
        }));
      } else {
        updateStatus('documents', 'error', data.error || 'Failed to save document');
      }
    } catch (error) {
      updateStatus('documents', 'error', 'An error occurred while uploading document');
    } finally {
      updateLoadingState('documents', false);
    }
  };

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPreferences(prev => ({ ...prev, [name]: checked }));
    } else {
      setPreferences(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePreferencesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateLoadingState('preferences', true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const data = await res.json();
      if (data.success) {
        updateStatus('preferences', 'success', 'Preferences updated successfully!');
        setUser(prev => prev ? { ...prev, ...data.data } : null);
      } else {
        updateStatus('preferences', 'error', data.error || 'Failed to update preferences');
      }
    } catch (error) {
      updateStatus('preferences', 'error', 'An error occurred while updating preferences');
    } finally {
      updateLoadingState('preferences', false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">You must be signed in to view your settings.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  ];

  const StatusMessage = ({ section }: { section: string }) => {
    const msg = status[section];
    if (!msg) return null;
    
    const bgColor = msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                   msg.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                   'bg-blue-50 border-blue-200 text-blue-800';
    
    return (
      <div className={`p-3 rounded-md border ${bgColor} mb-4`}>
        <div className="flex items-center">
          {msg.type === 'success' && <Check className="w-4 h-4 mr-2" />}
          {msg.type === 'error' && <X className="w-4 h-4 mr-2" />}
          <span className="text-sm">{msg.message}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <User className="w-6 h-6 text-red-600 mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                  </div>

                  <StatusMessage section="profile" />

                  <form onSubmit={handlePersonalInfoSave} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Image
                          src={personalInfo.image || '/images/Larnacei_coloured.png'}
                          alt="Profile Picture"
                          width={100}
                          height={100}
                          className="rounded-full object-cover border-4 border-gray-200"
                        />
                        <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{personalInfo.name || 'Your Name'}</h3>
                        <p className="text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-400">Click the camera icon to change your profile picture</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          name="name"
                          type="text"
                          value={personalInfo.name}
                          onChange={handlePersonalInfoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                          />
                          <div className="absolute right-3 top-2.5">
                            <div className="flex items-center text-green-600">
                              <Check className="w-4 h-4 mr-1" />
                              <span className="text-xs">Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <input
                            name="phone"
                            type="tel"
                            value={personalInfo.phone}
                            onChange={handlePersonalInfoChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="+234 801 234 5678"
                          />
                          <div className="absolute right-3 top-2.5">
                            {user.phoneVerified ? (
                              <div className="flex items-center text-green-600">
                                <Check className="w-4 h-4 mr-1" />
                                <span className="text-xs">Verified</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handlePhoneVerify}
                                disabled={loadingStates.phone}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                {loadingStates.phone ? 'Sending...' : 'Verify'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type
                        </label>
                        <input
                          type="text"
                          value={user.accountType}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio/Description
                      </label>
                      <textarea
                        name="bio"
                        value={personalInfo.bio}
                        onChange={handlePersonalInfoChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loadingStates.profile}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingStates.profile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>

                  <StatusMessage section="phone" />
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <Shield className="w-6 h-6 text-red-600 mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Security Settings</h2>
                  </div>

                  <StatusMessage section="password" />

                  <form onSubmit={handlePasswordSave} className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              name="current"
                              type={showPassword.current ? 'text' : 'password'}
                              value={passwords.current}
                              onChange={handlePasswordChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              name="new"
                              type={showPassword.new ? 'text' : 'password'}
                              value={passwords.new}
                              onChange={handlePasswordChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                              placeholder="Enter new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              name="confirm"
                              type={showPassword.confirm ? 'text' : 'password'}
                              value={passwords.confirm}
                              onChange={handlePasswordChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          disabled={loadingStates.password}
                          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loadingStates.password ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-red-600 mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Identity Documents</h2>
                  </div>

                  <StatusMessage section="documents" />

                  <div className="space-y-6">
                    {/* Verification Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Verification Status</h3>
                          <p className="text-sm text-gray-600">Current verification level: {user.verificationLevel}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.verificationLevel === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                          user.verificationLevel === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.verificationLevel}
                        </div>
                      </div>
                    </div>

                    {/* Document Upload Forms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* NIN */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">National Identification Number (NIN)</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Enter NIN"
                            value={documents.nin.number}
                            onChange={(e) => handleDocumentChange('nin', 'number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentChange('nin', 'file', e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleDocumentUpload('nin')}
                            disabled={loadingStates.documents || !documents.nin.file || !documents.nin.number}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload NIN
                          </button>
                        </div>
                      </div>

                      {/* BVN */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Bank Verification Number (BVN)</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Enter BVN"
                            value={documents.bvn.number}
                            onChange={(e) => handleDocumentChange('bvn', 'number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentChange('bvn', 'file', e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleDocumentUpload('bvn')}
                            disabled={loadingStates.documents || !documents.bvn.file || !documents.bvn.number}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload BVN
                          </button>
                        </div>
                      </div>

                      {/* Driver's License */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Driver's License</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Enter License Number"
                            value={documents.driversLicense.number}
                            onChange={(e) => handleDocumentChange('driversLicense', 'number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentChange('driversLicense', 'file', e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleDocumentUpload('driversLicense')}
                            disabled={loadingStates.documents || !documents.driversLicense.file || !documents.driversLicense.number}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload License
                          </button>
                        </div>
                      </div>

                      {/* International Passport */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">International Passport</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Enter Passport Number"
                            value={documents.passport.number}
                            onChange={(e) => handleDocumentChange('passport', 'number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentChange('passport', 'file', e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleDocumentUpload('passport')}
                            disabled={loadingStates.documents || !documents.passport.file || !documents.passport.number}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload Passport
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Documents */}
                    {user.verificationDocs && user.verificationDocs.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
                        <div className="space-y-3">
                          {user.verificationDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <p className="font-medium text-gray-900">{doc.documentType}</p>
                                  <p className="text-sm text-gray-600">
                                    Number: {doc.documentNumber || 'Not provided'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  doc.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.verificationStatus}
                                </span>
                                <a
                                  href={doc.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <SettingsIcon className="w-6 h-6 text-red-600 mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Communication Preferences</h2>
                  </div>

                  <StatusMessage section="preferences" />

                  <form onSubmit={handlePreferencesSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Contact Method
                        </label>
                        <select
                          name="contactPreference"
                          value={preferences.contactPreference}
                          onChange={handlePreferencesChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="EMAIL">Email</option>
                          <option value="PHONE">Phone</option>
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="PLATFORM_MESSAGE">Platform Messages</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            name="smsNotifications"
                            type="checkbox"
                            checked={preferences.smsNotifications}
                            onChange={handlePreferencesChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 text-sm text-gray-700">
                            Enable SMS notifications
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            name="profileVisibility"
                            type="checkbox"
                            checked={preferences.profileVisibility}
                            onChange={handlePreferencesChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 text-sm text-gray-700">
                            Make profile visible to other users
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            name="showContactInfo"
                            type="checkbox"
                            checked={preferences.showContactInfo}
                            onChange={handlePreferencesChange}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <label className="ml-3 text-sm text-gray-700">
                            Show contact information in listings
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loadingStates.preferences}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingStates.preferences ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}