'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  Settings, 
  DollarSign, 
  Shield, 
  Mail, 
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PlatformSettings {
  fees: {
    shortStayCommission: number;
    longTermRentalCommission: number;
    propertySaleCommission: number;
    landedPropertyCommission: number;
    listingFee: number;
    featuredPropertyFee: number;
    premiumAccountFee: number;
  };
  payment: {
    supportedCurrencies: string[];
    defaultCurrency: string;
    minimumPayout: number;
    paymentSchedule: string;
    processingFee: number;
  };
  moderation: {
    autoApproveTrustedUsers: boolean;
    imageQualityThreshold: number;
    spamDetectionEnabled: boolean;
    priceValidationEnabled: boolean;
    duplicateDetectionEnabled: boolean;
  };
  verification: {
    requireKYC: boolean;
    requirePhoneVerification: boolean;
    requireEmailVerification: boolean;
    documentTypes: string[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SystemSettingsPage() {
  const { data: initialSettings, isLoading, error } = useSWR('/api/admin/settings', fetcher);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Initialize settings when data is loaded
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

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

  const updateSettings = (section: keyof PlatformSettings, field: string, value: any) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  if (isLoading || !settings || !settings.fees) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="mt-2 text-red-600">Error loading settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-gray-600">
            Configure platform rules, fees, and automated systems
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Settings saved successfully!</span>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Error saving settings. Please try again.</span>
          </div>
        </div>
      )}

      {/* Fee Structure */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <DollarSign className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Fee Structure</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Commission Rates (%)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Stay Commission
                </label>
                <input
                  type="number"
                  value={settings.fees.shortStayCommission}
                  onChange={(e) => updateSettings('fees', 'shortStayCommission', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Term Rental Commission
                </label>
                <input
                  type="number"
                  value={settings.fees.longTermRentalCommission}
                  onChange={(e) => updateSettings('fees', 'longTermRentalCommission', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Sale Commission
                </label>
                <input
                  type="number"
                  value={settings.fees.propertySaleCommission}
                  onChange={(e) => updateSettings('fees', 'propertySaleCommission', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landed Property Commission
                </label>
                <input
                  type="number"
                  value={settings.fees.landedPropertyCommission}
                  onChange={(e) => updateSettings('fees', 'landedPropertyCommission', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Fees (₦)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Fee
                </label>
                <input
                  type="number"
                  value={settings.fees.listingFee}
                  onChange={(e) => updateSettings('fees', 'listingFee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Property Fee
                </label>
                <input
                  type="number"
                  value={settings.fees.featuredPropertyFee}
                  onChange={(e) => updateSettings('fees', 'featuredPropertyFee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Account Fee
                </label>
                <input
                  type="number"
                  value={settings.fees.premiumAccountFee}
                  onChange={(e) => updateSettings('fees', 'premiumAccountFee', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Payment Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Currency
            </label>
            <select
              value={settings.payment.defaultCurrency}
              onChange={(e) => updateSettings('payment', 'defaultCurrency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="NGN">NGN (Nigerian Naira)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Payout (₦)
            </label>
            <input
              type="number"
              value={settings.payment.minimumPayout}
              onChange={(e) => updateSettings('payment', 'minimumPayout', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Schedule
            </label>
            <select
              value={settings.payment.paymentSchedule}
              onChange={(e) => updateSettings('payment', 'paymentSchedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Fee (%)
            </label>
            <input
              type="number"
              value={settings.payment.processingFee}
              onChange={(e) => updateSettings('payment', 'processingFee', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Moderation Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Moderation Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto-approve Trusted Users
              </label>
              <input
                type="checkbox"
                checked={settings.moderation.autoApproveTrustedUsers}
                onChange={(e) => updateSettings('moderation', 'autoApproveTrustedUsers', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Spam Detection
              </label>
              <input
                type="checkbox"
                checked={settings.moderation.spamDetectionEnabled}
                onChange={(e) => updateSettings('moderation', 'spamDetectionEnabled', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Price Validation
              </label>
              <input
                type="checkbox"
                checked={settings.moderation.priceValidationEnabled}
                onChange={(e) => updateSettings('moderation', 'priceValidationEnabled', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Duplicate Detection
              </label>
              <input
                type="checkbox"
                checked={settings.moderation.duplicateDetectionEnabled}
                onChange={(e) => updateSettings('moderation', 'duplicateDetectionEnabled', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Quality Threshold (%)
            </label>
            <input
              type="number"
              value={settings.moderation.imageQualityThreshold}
              onChange={(e) => updateSettings('moderation', 'imageQualityThreshold', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="0"
              max="100"
              step="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum image quality score for automatic approval
            </p>
          </div>
        </div>
      </div>

      {/* Verification Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Verification Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Require KYC
              </label>
              <input
                type="checkbox"
                checked={settings.verification.requireKYC}
                onChange={(e) => updateSettings('verification', 'requireKYC', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Require Phone Verification
              </label>
              <input
                type="checkbox"
                checked={settings.verification.requirePhoneVerification}
                onChange={(e) => updateSettings('verification', 'requirePhoneVerification', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Require Email Verification
              </label>
              <input
                type="checkbox"
                checked={settings.verification.requireEmailVerification}
                onChange={(e) => updateSettings('verification', 'requireEmailVerification', e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accepted Document Types
            </label>
            <div className="space-y-2">
              {['NIN', 'BVN', 'Driver License', 'Passport'].map((docType) => (
                <div key={docType} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.verification.documentTypes.includes(docType)}
                    onChange={(e) => {
                      const newDocTypes = e.target.checked
                        ? [...settings.verification.documentTypes, docType]
                        : settings.verification.documentTypes.filter(type => type !== docType);
                      updateSettings('verification', 'documentTypes', newDocTypes);
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">{docType}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-6">
          <Mail className="w-6 h-6 text-orange-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Email Notifications
            </label>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => updateSettings('notifications', 'emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              SMS Notifications
            </label>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => updateSettings('notifications', 'smsNotifications', e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Push Notifications
            </label>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => updateSettings('notifications', 'pushNotifications', e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 