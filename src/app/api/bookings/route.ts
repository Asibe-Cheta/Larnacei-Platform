import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { initializeMockPayment, generatePaymentReference, calculatePaymentFees } from '@/lib/paystack-service';
import { z } from 'zod';

// Validation schema for booking creation
const createBookingSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  checkIn: z.string().datetime('Invalid check-in date'),
  checkOut: z.string().datetime('Invalid check-out date'),
  numberOfGuests: z.number().min(1, 'At least 1 guest is required'),
  adults: z.number().min(1, 'At least 1 adult is required'),
  children: z.number().min(0, 'Children cannot be negative').default(0),
  specialRequests: z.string().optional(),
  guestNotes: z.string().optional(),
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'USSD', 'MOBILE_MONEY', 'WALLET']).default('CARD')
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get property with owner details
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
      include: {
        owner: true,
        availability: true,
        images: { where: { isPrimary: true }, take: 1 }
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if property is available for booking
    if (property.availabilityStatus !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Property is not available for booking' }, { status: 400 });
    }

    // Validate dates
    const checkIn = new Date(validatedData.checkIn);
    const checkOut = new Date(validatedData.checkOut);
    const now = new Date();

    if (checkIn <= now) {
      return NextResponse.json({ error: 'Check-in date must be in the future' }, { status: 400 });
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 });
    }

    // Calculate total nights
    const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Check availability for the selected dates
    const availabilityCheck = await prisma.availability.findMany({
      where: {
        propertyId: validatedData.propertyId,
        date: {
          gte: checkIn,
          lt: checkOut
        }
      }
    });

    const unavailableDates = availabilityCheck.filter(av => !av.isAvailable);
    if (unavailableDates.length > 0) {
      return NextResponse.json({ 
        error: 'Property is not available for the selected dates',
        unavailableDates: unavailableDates.map(av => av.date)
      }, { status: 400 });
    }

    // Calculate pricing
    const basePrice = property.price * totalNights; // property.price is in kobo per night
    const cleaningFee = Math.floor(basePrice * 0.1); // 10% cleaning fee
    const serviceFee = Math.floor(basePrice * 0.03); // 3% service fee
    const securityDeposit = Math.floor(basePrice * 0.2); // 20% security deposit
    const taxes = Math.floor(basePrice * 0.075); // 7.5% VAT
    const discounts = 0; // No discounts for now

    const subtotal = basePrice + cleaningFee + serviceFee + securityDeposit + taxes - discounts;
    const totalAmount = subtotal;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        propertyId: validatedData.propertyId,
        guestId: user.id,
        checkIn,
        checkOut,
        totalNights,
        numberOfGuests: validatedData.numberOfGuests,
        adults: validatedData.adults,
        children: validatedData.children,
        basePrice,
        cleaningFee,
        serviceFee,
        securityDeposit,
        taxes,
        discounts,
        totalAmount,
        currency: property.currency,
        specialRequests: validatedData.specialRequests,
        guestNotes: validatedData.guestNotes,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        property: {
          include: {
            owner: true,
            images: { where: { isPrimary: true }, take: 1 }
          }
        },
        guest: true
      }
    });

    // Initialize payment
    const paymentReference = generatePaymentReference();
    
    const paymentData = {
      amount: totalAmount,
      currency: property.currency,
      email: user.email,
      reference: paymentReference,
      callback_url: `${process.env.NEXTAUTH_URL}/dashboard/bookings/${booking.id}/payment-callback`,
      metadata: {
        bookingId: booking.id,
        propertyId: property.id,
        guestId: user.id,
        paymentMethod: validatedData.paymentMethod
      }
    };

    const paymentResponse = await initializeMockPayment(paymentData);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: totalAmount,
        currency: property.currency,
        paymentMethod: validatedData.paymentMethod,
        paymentType: 'BOOKING_PAYMENT',
        paystackReference: paymentReference,
        status: 'PENDING',
        userId: user.id,
        bookingId: booking.id
      }
    });

    // Update booking with payment reference
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentIntentId: paymentReference }
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalNights: booking.totalNights,
        numberOfGuests: booking.numberOfGuests,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        property: {
          id: booking.property.id,
          title: booking.property.title,
          location: booking.property.location,
          image: booking.property.images[0]?.url
        },
        owner: {
          name: booking.property.owner.name,
          email: booking.property.owner.email
        }
      },
      payment: {
        reference: paymentReference,
        amount: totalAmount,
        currency: property.currency,
        status: paymentResponse.data.status
      },
      pricing: {
        basePrice,
        cleaningFee,
        serviceFee,
        securityDeposit,
        taxes,
        discounts,
        totalAmount
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to create booking' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { guestId: user.id };
    if (status) {
      where.status = status;
    }

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          property: {
            include: {
              images: { where: { isPrimary: true }, take: 1 }
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.booking.count({ where })
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch bookings' 
    }, { status: 500 });
  }
} 