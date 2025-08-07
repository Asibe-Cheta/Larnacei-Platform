import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const respondSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = respondSchema.parse(body);

    // Get the inquiry and verify ownership
    const inquiry = await prisma.propertyInquiry.findUnique({
      where: { id: params.id },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
        conversation: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });
    }

    // Check if the current user is the property owner
    if (inquiry.property.ownerId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Create or get conversation
    let conversation = inquiry.conversation;
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          inquiryId: inquiry.id,
          participants: [inquiry.property.ownerId, inquiry.inquirerId],
        },
      });
    }

    // Add the response message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: validatedData.message,
        messageType: 'RESPONSE',
      },
    });

    // Update inquiry status
    await prisma.propertyInquiry.update({
      where: { id: params.id },
      data: {
        status: 'RESPONDED',
      },
    });

    // Send email notification to inquirer
    try {
      const { sendInquiryResponseNotification } = await import('@/lib/email-service');
      await sendInquiryResponseNotification({
        inquirerEmail: inquiry.inquirerEmail,
        inquirerName: inquiry.inquirerName,
        propertyTitle: inquiry.property.title,
        ownerName: inquiry.property.owner.name,
        response: validatedData.message,
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Response sent successfully',
      data: { message },
    });

  } catch (error) {
    console.error('Error responding to inquiry:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
