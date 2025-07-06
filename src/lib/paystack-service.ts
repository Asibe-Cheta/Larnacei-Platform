import { Currency, PaymentStatus } from '@prisma/client';

// Define PaymentMethod enum locally since it's not exported from Prisma client yet
enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  USSD = 'USSD',
  MOBILE_MONEY = 'MOBILE_MONEY',
  WALLET = 'WALLET'
}

// Mock Paystack API responses for development
export interface MockPaystackResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending';
    gateway_response: string;
    paid_at: string;
    channel: string;
    fees: number;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      card_type: string;
      bank: string;
    };
  };
}

export interface PaymentRequest {
  amount: number; // Amount in kobo
  currency: Currency;
  email: string;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

export interface PaymentVerificationRequest {
  reference: string;
}

export interface TransferRequest {
  amount: number; // Amount in kobo
  currency: Currency;
  recipient: string;
  reason?: string;
  reference?: string;
}

// Mock payment data store (in production, this would be Paystack's servers)
const mockPayments = new Map<string, MockPaystackResponse['data']>();

// Generate realistic mock data
const generateMockPaymentData = (
  amount: number,
  currency: Currency,
  reference: string,
  method: PaymentMethod
): MockPaystackResponse['data'] => {
  const now = new Date();
  const isSuccess = Math.random() > 0.1; // 90% success rate for testing
  
  const channels = {
    [PaymentMethod.CARD]: 'card',
    [PaymentMethod.BANK_TRANSFER]: 'bank',
    [PaymentMethod.USSD]: 'ussd',
    [PaymentMethod.MOBILE_MONEY]: 'mobile_money',
    [PaymentMethod.WALLET]: 'wallet'
  };

  const banks = [
    'Access Bank',
    'Zenith Bank',
    'GT Bank',
    'First Bank',
    'UBA',
    'Stanbic IBTC',
    'Fidelity Bank',
    'Union Bank'
  ];

  const cardTypes = ['visa', 'mastercard', 'verve'];

  return {
    reference,
    amount,
    currency: currency.toLowerCase(),
    status: isSuccess ? 'success' : 'failed',
    gateway_response: isSuccess ? 'Successful' : 'Transaction failed',
    paid_at: isSuccess ? now.toISOString() : '',
    channel: channels[method] || 'card',
    fees: Math.floor(amount * 0.015), // 1.5% fee
    authorization: {
      authorization_code: `AUTH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      bin: '408408',
      last4: Math.floor(Math.random() * 9000 + 1000).toString(),
      exp_month: (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0'),
      exp_year: (new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).toString(),
      card_type: cardTypes[Math.floor(Math.random() * cardTypes.length)],
      bank: banks[Math.floor(Math.random() * banks.length)]
    }
  };
};

// Mock payment initialization
export const initializeMockPayment = async (paymentData: PaymentRequest): Promise<MockPaystackResponse> => {
  const { amount, currency, email, reference, metadata } = paymentData;
  
  // Validate amount (minimum 100 kobo = ₦1)
  if (amount < 100) {
    throw new Error('Amount must be at least 100 kobo (₦1)');
  }

  // Validate currency
  if (!Object.values(Currency).includes(currency)) {
    throw new Error('Invalid currency');
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Generate mock payment data
  const paymentMethod = metadata?.paymentMethod || PaymentMethod.CARD;
  const mockData = generateMockPaymentData(amount, currency, reference, paymentMethod);
  
  // Store mock payment data
  mockPayments.set(reference, mockData);

  return {
    status: true,
    message: 'Payment initialization successful',
    data: mockData
  };
};

// Mock payment verification
export const verifyMockPayment = async (reference: string): Promise<MockPaystackResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  const paymentData = mockPayments.get(reference);
  
  if (!paymentData) {
    throw new Error('Payment reference not found');
  }

  return {
    status: true,
    message: 'Payment verification successful',
    data: paymentData
  };
};

// Mock transfer initiation
export const initiateMockTransfer = async (transferData: TransferRequest): Promise<any> => {
  const { amount, currency, recipient, reason, reference } = transferData;
  
  // Validate amount
  if (amount < 100) {
    throw new Error('Transfer amount must be at least 100 kobo (₦1)');
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const transferReference = reference || `TRF_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const isSuccess = Math.random() > 0.05; // 95% success rate for transfers

  return {
    status: true,
    message: 'Transfer initiated successfully',
    data: {
      reference: transferReference,
      amount,
      currency: currency.toLowerCase(),
      recipient,
      reason: reason || 'Payout',
      status: isSuccess ? 'success' : 'pending',
      transfer_code: `T${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
};

// Mock bank list (Nigerian banks)
export const getMockBanks = async (): Promise<any> => {
  const banks = [
    { name: 'Access Bank', code: '044', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'Zenith Bank', code: '057', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'GT Bank', code: '058', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'First Bank', code: '011', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'UBA', code: '033', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'Stanbic IBTC', code: '221', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'Fidelity Bank', code: '070', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'Union Bank', code: '032', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'Ecobank', code: '050', active: true, country: 'Nigeria', currency: 'NGN' },
    { name: 'Polaris Bank', code: '076', active: true, country: 'Nigeria', currency: 'NGN' }
  ];

  return {
    status: true,
    message: 'Banks retrieved successfully',
    data: banks
  };
};

// Mock account verification
export const verifyMockAccount = async (accountNumber: string, bankCode: string): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Mock account verification (in real implementation, this would call Paystack's API)
  const isValid = accountNumber.length === 10 && /^\d+$/.test(accountNumber);
  
  if (!isValid) {
    throw new Error('Invalid account number');
  }

  const accountNames = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Sarah Williams',
    'David Brown',
    'Lisa Davis',
    'Robert Wilson',
    'Mary Anderson',
    'James Taylor',
    'Patricia Martinez'
  ];

  return {
    status: true,
    message: 'Account verification successful',
    data: {
      account_number: accountNumber,
      account_name: accountNames[Math.floor(Math.random() * accountNames.length)],
      bank_id: parseInt(bankCode)
    }
  };
};

// Utility functions for payment processing
export const calculatePaymentFees = (amount: number, currency: Currency = Currency.NGN): number => {
  // Paystack fees: 1.5% + ₦100 for NGN, 3.9% for USD, 3.9% for GBP
  const percentageFee = currency === Currency.NGN ? 0.015 : 0.039;
  const fixedFee = currency === Currency.NGN ? 100 : 0;
  
  return Math.floor(amount * percentageFee) + fixedFee;
};

export const formatAmountForDisplay = (amount: number, currency: Currency = Currency.NGN): string => {
  const symbols = {
    [Currency.NGN]: '₦',
    [Currency.USD]: '$',
    [Currency.GBP]: '£',
    [Currency.EUR]: '€'
  };

  const symbol = symbols[currency];
  const amountInMainUnit = amount / 100; // Convert from kobo to main unit
  
  return `${symbol}${amountInMainUnit.toLocaleString()}`;
};

export const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `LARNACEI_${timestamp}_${random}`.toUpperCase();
};

// Mock webhook simulation (for testing)
export const simulateWebhook = async (reference: string, status: 'success' | 'failed'): Promise<void> => {
  const paymentData = mockPayments.get(reference);
  
  if (paymentData) {
    paymentData.status = status;
    paymentData.paid_at = status === 'success' ? new Date().toISOString() : '';
    paymentData.gateway_response = status === 'success' ? 'Successful' : 'Transaction failed';
    
    mockPayments.set(reference, paymentData);
  }
};

// Clear mock data (for testing)
export const clearMockPayments = (): void => {
  mockPayments.clear();
}; 