import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get platform settings from database
    const settings = await prisma.platformSettings.findFirst();

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        fees: {
          shortStayCommission: 10,
          longTermRentalCommission: 8,
          propertySaleCommission: 5,
          landedPropertyCommission: 5,
          listingFee: 0,
          featuredPropertyFee: 5000,
          premiumAccountFee: 10000
        },
        payment: {
          supportedCurrencies: ['NGN', 'USD', 'GBP'],
          defaultCurrency: 'NGN',
          minimumPayout: 5000,
          paymentSchedule: 'weekly',
          processingFee: 2.5
        },
        moderation: {
          autoApproveTrustedUsers: true,
          imageQualityThreshold: 80,
          spamDetectionEnabled: true,
          priceValidationEnabled: true,
          duplicateDetectionEnabled: true
        },
        verification: {
          requireKYC: true,
          requirePhoneVerification: true,
          requireEmailVerification: true,
          documentTypes: ['NIN', 'BVN', 'Driver License', 'Passport']
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true
        }
      });
    }

    return NextResponse.json({
      fees: {
        shortStayCommission: settings.shortStayCommission || 10,
        longTermRentalCommission: settings.longTermRentalCommission || 8,
        propertySaleCommission: settings.propertySaleCommission || 5,
        landedPropertyCommission: settings.landedPropertyCommission || 5,
        listingFee: settings.listingFee || 0,
        featuredPropertyFee: settings.featuredPropertyFee || 5000,
        premiumAccountFee: settings.premiumAccountFee || 10000
      },
      payment: {
        supportedCurrencies: settings.supportedCurrencies || ['NGN', 'USD', 'GBP'],
        defaultCurrency: settings.defaultCurrency || 'NGN',
        minimumPayout: settings.minimumPayout || 5000,
        paymentSchedule: settings.paymentSchedule || 'weekly',
        processingFee: settings.processingFee || 2.5
      },
      moderation: {
        autoApproveTrustedUsers: settings.autoApproveTrustedUsers ?? true,
        imageQualityThreshold: settings.imageQualityThreshold || 80,
        spamDetectionEnabled: settings.spamDetectionEnabled ?? true,
        priceValidationEnabled: settings.priceValidationEnabled ?? true,
        duplicateDetectionEnabled: settings.duplicateDetectionEnabled ?? true
      },
      verification: {
        requireKYC: settings.requireKYC ?? true,
        requirePhoneVerification: settings.requirePhoneVerification ?? true,
        requireEmailVerification: settings.requireEmailVerification ?? true,
        documentTypes: settings.documentTypes || ['NIN', 'BVN', 'Driver License', 'Passport']
      },
      notifications: {
        emailNotifications: settings.emailNotifications ?? true,
        smsNotifications: settings.smsNotifications ?? false,
        pushNotifications: settings.pushNotifications ?? true
      }
    });

  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { fees, payment, moderation, verification, notifications } = body;

    // Validate required fields
    if (!fees || !payment || !moderation || !verification || !notifications) {
      return NextResponse.json(
        { error: 'Missing required settings sections' },
        { status: 400 }
      );
    }

    // Validate fee structure
    if (fees.shortStayCommission < 0 || fees.shortStayCommission > 100) {
      return NextResponse.json(
        { error: 'Short stay commission must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (fees.longTermRentalCommission < 0 || fees.longTermRentalCommission > 100) {
      return NextResponse.json(
        { error: 'Long term rental commission must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (fees.propertySaleCommission < 0 || fees.propertySaleCommission > 100) {
      return NextResponse.json(
        { error: 'Property sale commission must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (fees.landedPropertyCommission < 0 || fees.landedPropertyCommission > 100) {
      return NextResponse.json(
        { error: 'Landed property commission must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate payment settings
    if (payment.minimumPayout < 0) {
      return NextResponse.json(
        { error: 'Minimum payout must be positive' },
        { status: 400 }
      );
    }

    if (payment.processingFee < 0 || payment.processingFee > 100) {
      return NextResponse.json(
        { error: 'Processing fee must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate moderation settings
    if (moderation.imageQualityThreshold < 0 || moderation.imageQualityThreshold > 100) {
      return NextResponse.json(
        { error: 'Image quality threshold must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update or create platform settings
    const updatedSettings = await prisma.platformSettings.upsert({
      where: { id: 1 }, // Assuming single settings record
      update: {
        // Fee structure
        shortStayCommission: fees.shortStayCommission,
        longTermRentalCommission: fees.longTermRentalCommission,
        propertySaleCommission: fees.propertySaleCommission,
        landedPropertyCommission: fees.landedPropertyCommission,
        listingFee: fees.listingFee,
        featuredPropertyFee: fees.featuredPropertyFee,
        premiumAccountFee: fees.premiumAccountFee,

        // Payment settings
        supportedCurrencies: payment.supportedCurrencies,
        defaultCurrency: payment.defaultCurrency,
        minimumPayout: payment.minimumPayout,
        paymentSchedule: payment.paymentSchedule,
        processingFee: payment.processingFee,

        // Moderation settings
        autoApproveTrustedUsers: moderation.autoApproveTrustedUsers,
        imageQualityThreshold: moderation.imageQualityThreshold,
        spamDetectionEnabled: moderation.spamDetectionEnabled,
        priceValidationEnabled: moderation.priceValidationEnabled,
        duplicateDetectionEnabled: moderation.duplicateDetectionEnabled,

        // Verification settings
        requireKYC: verification.requireKYC,
        requirePhoneVerification: verification.requirePhoneVerification,
        requireEmailVerification: verification.requireEmailVerification,
        documentTypes: verification.documentTypes,

        // Notification settings
        emailNotifications: notifications.emailNotifications,
        smsNotifications: notifications.smsNotifications,
        pushNotifications: notifications.pushNotifications,

        updatedAt: new Date(),
        updatedBy: session.user.email
      },
      create: {
        id: 1,
        // Fee structure
        shortStayCommission: fees.shortStayCommission,
        longTermRentalCommission: fees.longTermRentalCommission,
        propertySaleCommission: fees.propertySaleCommission,
        landedPropertyCommission: fees.landedPropertyCommission,
        listingFee: fees.listingFee,
        featuredPropertyFee: fees.featuredPropertyFee,
        premiumAccountFee: fees.premiumAccountFee,

        // Payment settings
        supportedCurrencies: payment.supportedCurrencies,
        defaultCurrency: payment.defaultCurrency,
        minimumPayout: payment.minimumPayout,
        paymentSchedule: payment.paymentSchedule,
        processingFee: payment.processingFee,

        // Moderation settings
        autoApproveTrustedUsers: moderation.autoApproveTrustedUsers,
        imageQualityThreshold: moderation.imageQualityThreshold,
        spamDetectionEnabled: moderation.spamDetectionEnabled,
        priceValidationEnabled: moderation.priceValidationEnabled,
        duplicateDetectionEnabled: moderation.duplicateDetectionEnabled,

        // Verification settings
        requireKYC: verification.requireKYC,
        requirePhoneVerification: verification.requirePhoneVerification,
        requireEmailVerification: verification.requireEmailVerification,
        documentTypes: verification.documentTypes,

        // Notification settings
        emailNotifications: notifications.emailNotifications,
        smsNotifications: notifications.smsNotifications,
        pushNotifications: notifications.pushNotifications,

        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.email,
        updatedBy: session.user.email
      }
    });

    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        action: 'UPDATE_PLATFORM_SETTINGS',
        adminId: session.user.email,
        targetType: 'PLATFORM_SETTINGS',
        targetId: '1',
        details: {
          sections: ['fees', 'payment', 'moderation', 'verification', 'notifications'],
          updatedBy: session.user.email
        }
      }
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Admin settings POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 