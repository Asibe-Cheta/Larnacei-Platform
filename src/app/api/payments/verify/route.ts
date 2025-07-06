import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { verifyMockPayment } from '@/lib/paystack-service';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required')
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reference } = verifyPaymentSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { paystackReference: reference },
      include: {
        booking: {
          include: {
            property: {
              include: {
                owner: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify payment ownership
    if (payment.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to verify this payment' }, { status: 403 });
    }

    // Verify payment with Paystack (mock)
    const verificationResponse = await verifyMockPayment(reference);

    if (!verificationResponse.status) {
      return NextResponse.json({ 
        error: 'Payment verification failed',
        message: verificationResponse.message 
      }, { status: 400 });
    }

    const paymentData = verificationResponse.data;

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentData.status === 'success' ? 'PAID' : 'FAILED',
        gatewayResponse: paymentData.gateway_response,
        paidAt: paymentData.status === 'success' ? new Date(paymentData.paid_at) : null,
        paystackChannel: paymentData.channel,
        paystackFees: paymentData.fees,
        paystackAuthorizationCode: paymentData.authorization?.authorization_code
      }
    });

    // If payment is successful and there's a booking, update booking status
    if (paymentData.status === 'success' && payment.booking) {
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paidAt: new Date()
        }
      });

      // Create notification for property owner
      await prisma.notification.create({
        data: {
          userId: payment.booking.property.owner.id,
          title: 'New Booking Payment Received',
          message: `Payment of ${payment.amount / 100} ${payment.currency} received for booking #${payment.booking.id}`,
          type: 'PAYMENT_RECEIVED'
        }
      });

      // Create notification for guest
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Payment Successful',
          message: `Your payment of ${payment.amount / 100} ${payment.currency} has been confirmed. Your booking is now confirmed.`,
          type: 'BOOKING_CONFIRMED'
        }
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        reference: updatedPayment.paystackReference,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        status: updatedPayment.status,
        paidAt: updatedPayment.paidAt,
        gatewayResponse: updatedPayment.gatewayResponse
      },
      booking: payment.booking ? {
        id: payment.booking.id,
        status: paymentData.status === 'success' ? 'CONFIRMED' : 'PENDING',
        paymentStatus: paymentData.status === 'success' ? 'PAID' : 'PENDING'
      } : null
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to verify payment' 
    }, { status: 500 });
  }
} 