'use client';

import { useState } from 'react';
import { formatPrice } from '@/utils/formatters';
import { generateWhatsAppMessage, openWhatsApp } from '@/utils/whatsapp';

interface Owner {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface ContactFormProps {
  propertyId: string;
  owner: Owner;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  propertyCurrency: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: string;
  inquiryType: string;
  intendedUse: string;
  budget: string;
  timeframe: string;
  financingNeeded: boolean;
  requestViewing: boolean;
  viewingDate?: string;
  viewingTime?: string;
  virtualViewingInterest: boolean;
}

export default function ContactForm({ propertyId, owner, propertyTitle, propertyLocation, propertyPrice, propertyCurrency }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'WHATSAPP',
    inquiryType: 'GENERAL_INFO',
    intendedUse: '',
    budget: '',
    timeframe: '',
    financingNeeded: false,
    requestViewing: false,
    virtualViewingInterest: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    // Worldwide phone number validation
    const cleanPhone = formData.phone.replace(/[^\d+]/g, "");
    const internationalPattern = /^\+[1-9]\d{1,14}$/;
    const localPatterns = [
      /^[1-9]\d{9,14}$/, // 10-15 digits starting with 1-9
      /^0[1-9]\d{8,13}$/, // Local format starting with 0
    ];
    
    if (!internationalPattern.test(cleanPhone) && !localPatterns.some(pattern => pattern.test(cleanPhone))) {
      setError('Please enter a valid phone number (international format preferred)');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return false;
    }
    if (formData.requestViewing && (!formData.viewingDate || !formData.viewingTime)) {
      setError('Please select viewing date and time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/inquire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          preferredContact: 'WHATSAPP',
          inquiryType: 'GENERAL_INFO',
          intendedUse: '',
          budget: '',
          timeframe: '',
          financingNeeded: false,
          requestViewing: false,
          virtualViewingInterest: false,
        });
      } else {
        setError(data.message || 'Failed to send inquiry');
      }
    } catch (err) {
      setError('Failed to send inquiry. Please try again.');
      console.error('Inquiry error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const message = generateWhatsAppMessage({
      propertyTitle,
      propertyLocation,
      propertyPrice,
      propertyCurrency: propertyCurrency as any,
      inquirerName: formData.name || 'Property Seeker',
      inquirerPhone: formData.phone || '',
      inquiryType: formData.inquiryType,
      message: formData.message,
      propertyUrl: window.location.href,
    });
    
    if (owner.phone) {
      openWhatsApp(owner.phone, message);
    }
  };

  const handleCallDirect = () => {
    if (owner.phone) {
      window.location.href = `tel:${owner.phone}`;
    }
  };

  const handleEmailDirect = () => {
    const subject = `Inquiry about ${propertyTitle}`;
    const body = `Hi ${owner.name || 'there'},

I'm interested in your property listing: ${propertyTitle}
Location: ${propertyLocation}
Price: ${formatPrice(propertyPrice, propertyCurrency as any)}

Could you please provide more information about this property?

Best regards,
${formData.name || 'Property Seeker'}`;

    const mailtoUrl = `mailto:${owner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inquiry Sent Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your inquiry has been sent to the property owner. They will get back to you soon.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="btn btn-primary"
          >
            Send Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Owner</h2>
      
      {/* Quick Contact Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button
          onClick={handleWhatsAppDirect}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          WhatsApp
        </button>
        
        <button
          onClick={handleCallDirect}
          className="btn btn-outline flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call
        </button>

        <button
          onClick={handleEmailDirect}
          className="btn btn-outline flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </button>
      </div>

      <div className="text-center mb-6">
        <span className="text-gray-500 text-sm">or</span>
      </div>

      {/* Inquiry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="+1 234 567 8900 or +44 20 7946 0958"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter a valid phone number (international format preferred)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredContact">
            Preferred Contact Method
          </label>
          <select
            id="preferredContact"
            name="preferredContact"
            value={formData.preferredContact}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PHONE">Phone Call</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </select>
        </div>

        {/* Inquiry Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="inquiryType">
            Inquiry Type *
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            value={formData.inquiryType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="GENERAL_INFO">General Information</option>
            <option value="VIEWING_REQUEST">Schedule Viewing</option>
            <option value="PRICE_INQUIRY">Price Negotiation</option>
            <option value="PURCHASE_INTENT">Purchase/Rental Application</option>
            <option value="INVESTMENT_INQUIRY">Investment Inquiry</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="intendedUse">
            Intended Use
          </label>
          <input
            type="text"
            id="intendedUse"
            name="intendedUse"
            value={formData.intendedUse}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., Family home, Investment, Office space"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="budget">
              Budget Range (Optional)
            </label>
            <input
              type="text"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., ₦50M - ₦100M"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="timeframe">
              Timeframe
            </label>
            <select
              id="timeframe"
              name="timeframe"
              value={formData.timeframe}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select timeframe</option>
              <option value="IMMEDIATE">Immediate</option>
              <option value="WITHIN_1_MONTH">Within 1 month</option>
              <option value="WITHIN_3_MONTHS">Within 3 months</option>
              <option value="WITHIN_6_MONTHS">Within 6 months</option>
              <option value="WITHIN_1_YEAR">Within 1 year</option>
              <option value="NO_RUSH">No rush</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="financingNeeded"
            name="financingNeeded"
            checked={formData.financingNeeded}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label className="ml-2 text-sm text-gray-700" htmlFor="financingNeeded">
            I need financing assistance
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
            Message/Questions *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="Tell the owner about your interest in this property, ask specific questions, or provide additional details..."
            required
          />
        </div>

        {/* Viewing Preferences */}
        <div className="border-t pt-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="requestViewing"
              name="requestViewing"
              checked={formData.requestViewing}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="requestViewing">
              Request property viewing
            </label>
          </div>

          {formData.requestViewing && (
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="viewingDate">
                    Preferred Viewing Date *
                  </label>
                  <input
                    type="date"
                    id="viewingDate"
                    name="viewingDate"
                    value={formData.viewingDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    min={new Date().toISOString().split('T')[0]}
                    required={formData.requestViewing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="viewingTime">
                    Preferred Viewing Time *
                  </label>
                  <select
                    id="viewingTime"
                    name="viewingTime"
                    value={formData.viewingTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    required={formData.requestViewing}
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="virtualViewingInterest"
                  name="virtualViewingInterest"
                  checked={formData.virtualViewingInterest}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label className="ml-2 text-sm text-gray-700" htmlFor="virtualViewingInterest">
                  I'm also interested in virtual viewing
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-3"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending...
            </div>
          ) : (
            'Send Inquiry'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By sending this inquiry, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
} 