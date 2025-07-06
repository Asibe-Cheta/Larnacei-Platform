'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Users, CreditCard, MapPin, Star, Clock, Shield } from 'lucide-react';
import { formatAmountForDisplay, calculatePaymentFees } from '@/lib/paystack-service';

// Validation schema
const bookingSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  numberOfGuests: z.number().min(1, 'At least 1 guest is required'),
  adults: z.number().min(1, 'At least 1 adult is required'),
  children: z.number().min(0).default(0),
  specialRequests: z.string().optional(),
  guestNotes: z.string().optional(),
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'USSD', 'MOBILE_MONEY', 'WALLET']).default('CARD')
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  images: { url: string; alt?: string }[];
  owner: {
    name: string;
    email: string;
  };
  features: string[];
  availabilityStatus: string;
}

interface PricingBreakdown {
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  securityDeposit: number;
  taxes: number;
  discounts: number;
  totalAmount: number;
}

export default function PropertyBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ checkIn: Date | null; checkOut: Date | null }>({
    checkIn: null,
    checkOut: null
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfGuests: 1,
      adults: 1,
      children: 0,
      paymentMethod: 'CARD'
    }
  });

  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');
  const watchNumberOfGuests = watch('numberOfGuests');
  const watchAdults = watch('adults');

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProperty(data);
        } else {
          router.push('/properties');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        router.push('/properties');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id, router]);

  // Calculate pricing when dates or guests change
  useEffect(() => {
    if (property && watchCheckIn && watchCheckOut) {
      const checkIn = new Date(watchCheckIn);
      const checkOut = new Date(watchCheckOut);
      const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      if (totalNights > 0) {
        const basePrice = property.price * totalNights;
        const cleaningFee = Math.floor(basePrice * 0.1); // 10%
        const serviceFee = Math.floor(basePrice * 0.03); // 3%
        const securityDeposit = Math.floor(basePrice * 0.2); // 20%
        const taxes = Math.floor(basePrice * 0.075); // 7.5% VAT
        const discounts = 0;

        setPricing({
          basePrice,
          cleaningFee,
          serviceFee,
          securityDeposit,
          taxes,
          discounts,
          totalAmount: basePrice + cleaningFee + serviceFee + securityDeposit + taxes - discounts
        });
      }
    }
  }, [property, watchCheckIn, watchCheckOut]);

  // Handle date selection
  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    setValue(field, value);
    setSelectedDates(prev => ({
      ...prev,
      [field]: value ? new Date(value) : null
    }));
  };

  // Handle guest count changes
  const handleGuestChange = (field: 'adults' | 'children', value: number) => {
    setValue(field, value);
    const adults = field === 'adults' ? value : watchAdults;
    const children = field === 'children' ? value : watchNumberOfGuests - watchAdults;
    setValue('numberOfGuests', adults + children);
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!session) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          propertyId: property?.id
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to payment page or show success
        router.push(`/dashboard/bookings/${result.booking.id}/payment`);
      } else {
        alert(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Property not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={property.images[0]?.url || '/images/placeholder.jpg'}
                    alt={property.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.location}, {property.city}, {property.state}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    {property.bedrooms && (
                      <span>{property.bedrooms} bedrooms</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} bathrooms</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-700">
                    {formatAmountForDisplay(property.price, property.currency as any)}/night
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>

              {/* Host Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hosted by {property.owner.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>4.8 (24 reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-500 mr-1" />
                    <span>Verified Host</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Booking</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Select Dates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        {...register('checkIn')}
                        onChange={(e) => handleDateChange('checkIn', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {errors.checkIn && (
                        <p className="mt-1 text-sm text-red-600">{errors.checkIn.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        {...register('checkOut')}
                        onChange={(e) => handleDateChange('checkOut', e.target.value)}
                        min={watchCheckIn || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {errors.checkOut && (
                        <p className="mt-1 text-sm text-red-600">{errors.checkOut.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Guest Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adults
                      </label>
                      <select
                        {...register('adults', { valueAsNumber: true })}
                        onChange={(e) => handleGuestChange('adults', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Children
                      </label>
                      <select
                        {...register('children', { valueAsNumber: true })}
                        onChange={(e) => handleGuestChange('children', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Total guests: {watchNumberOfGuests}
                  </p>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    rows={3}
                    placeholder="Any special requests or requirements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { value: 'CARD', label: 'Card', icon: '💳' },
                      { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
                      { value: 'USSD', label: 'USSD', icon: '📱' },
                      { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: '📲' },
                      { value: 'WALLET', label: 'Wallet', icon: '👛' }
                    ].map(method => (
                      <label
                        key={method.value}
                        className="flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors"
                      >
                        <input
                          type="radio"
                          value={method.value}
                          {...register('paymentMethod')}
                          className="sr-only"
                        />
                        <span className="text-2xl mb-1">{method.icon}</span>
                        <span className="text-xs text-center">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !pricing}
                  className="w-full bg-red-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Processing...' : 'Continue to Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              {pricing ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Base Price ({pricing.basePrice / property.price} nights)</span>
                    <span>{formatAmountForDisplay(pricing.basePrice, property.currency as any)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Cleaning Fee</span>
                    <span>{formatAmountForDisplay(pricing.cleaningFee, property.currency as any)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Service Fee</span>
                    <span>{formatAmountForDisplay(pricing.serviceFee, property.currency as any)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Security Deposit</span>
                    <span>{formatAmountForDisplay(pricing.securityDeposit, property.currency as any)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Taxes (VAT)</span>
                    <span>{formatAmountForDisplay(pricing.taxes, property.currency as any)}</span>
                  </div>
                  
                  {pricing.discounts > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discounts</span>
                      <span>-{formatAmountForDisplay(pricing.discounts, property.currency as any)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatAmountForDisplay(pricing.totalAmount, property.currency as any)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Includes all fees and taxes
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select dates to see pricing</p>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Free cancellation up to 24 hours before check-in</p>
                  <p>• 50% refund if cancelled within 24 hours</p>
                  <p>• No refund for same-day cancellations</p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payment</p>
                    <p>Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 