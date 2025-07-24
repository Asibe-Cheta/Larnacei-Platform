'use client';

import { useState } from 'react';
import {
  Save,
  Shield,
  Mail,
  Phone,
  Globe,
  Database,
  Key,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';

interface SettingsFormData {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  adminEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  sendgridApiKey: string;
  sendgridFromEmail: string;
  sendgridFromName: string;
  paystackSecretKey: string;
  paystackPublicKey: string;
  googleMapsApiKey: string;
  redisUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  sessionSecret: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SettingsFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: string, value: string | number | boolean | string[]) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleInputChange = (field: string, value: string) => {
    updateSettings(field, value);
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    updateSettings(field, numValue);
  };

  const handleArrayChange = (field: string, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    updateSettings(field, arrayValue);
  };

  const getArrayDisplay = (array: string[]) => {
    return array.join(', ');
  };

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'success':
        return 'Settings saved successfully!';
      case 'error':
        return 'Error saving settings. Please try again.';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Mock settings data for demonstration
  const mockSettings: SettingsFormData = {
    siteName: 'Larnacei Platform',
    siteDescription: 'Premium property marketplace in Nigeria',
    contactEmail: 'contact@larnacei.com',
    contactPhone: '+234 801 234 5678',
    supportEmail: 'support@larnacei.com',
    adminEmail: 'admin@larnacei.com',
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@larnacei.com',
    smtpPassword: '********',
    twilioAccountSid: 'AC1234567890abcdef',
    twilioAuthToken: '********',
    twilioPhoneNumber: '+234 801 234 5678',
    mailgunApiKey: 'key-1234567890abcdef',
    mailgunDomain: 'mg.larnacei.com',
    paystackSecretKey: 'sk_test_1234567890abcdef',
    paystackPublicKey: 'pk_test_1234567890abcdef',
    googleMapsApiKey: 'AIzaSyB1234567890abcdef',
    redisUrl: 'redis://localhost:6379',
    databaseUrl: 'postgresql://user:password@localhost:5432/larnacei',
    jwtSecret: 'your-super-secret-jwt-key-here',
    sessionSecret: 'your-super-secret-session-key-here',
  };

  // Initialize settings if not already set
  if (!settings) {
    setSettings(mockSettings);
    return <div>Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform settings and integrations</p>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow border-l-4 border-l-green-500">
            <div className="flex items-center">
              {getStatusIcon()}
              <span className={`ml-2 font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              General Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => handleNumberChange('smtpPort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.smtpUser}
                  onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SMS Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              SMS Configuration (Twilio)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account SID
                </label>
                <input
                  type="text"
                  value={settings.twilioAccountSid}
                  onChange={(e) => handleInputChange('twilioAccountSid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auth Token
                </label>
                <input
                  type="password"
                  value={settings.twilioAuthToken}
                  onChange={(e) => handleInputChange('twilioAuthToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.twilioPhoneNumber}
                  onChange={(e) => handleInputChange('twilioPhoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Configuration (Paystack)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={settings.paystackSecretKey}
                  onChange={(e) => handleInputChange('paystackSecretKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Key
                </label>
                <input
                  type="text"
                  value={settings.paystackPublicKey}
                  onChange={(e) => handleInputChange('paystackPublicKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JWT Secret
                </label>
                <input
                  type="password"
                  value={settings.jwtSecret}
                  onChange={(e) => handleInputChange('jwtSecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Secret
                </label>
                <input
                  type="password"
                  value={settings.sessionSecret}
                  onChange={(e) => handleInputChange('sessionSecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Configuration
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database URL
                </label>
                <input
                  type="text"
                  value={settings.databaseUrl}
                  onChange={(e) => handleInputChange('databaseUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redis URL
                </label>
                <input
                  type="text"
                  value={settings.redisUrl}
                  onChange={(e) => handleInputChange('redisUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              File Upload Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max File Size (bytes)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleNumberChange('maxFileSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed File Types (comma-separated)
                </label>
                <input
                  type="text"
                  value={getArrayDisplay(settings.allowedFileTypes)}
                  onChange={(e) => handleArrayChange('allowedFileTypes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 