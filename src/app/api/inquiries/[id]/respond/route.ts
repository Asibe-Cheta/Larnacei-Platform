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
    console.log('=== INQUIRY RESPONSE API START ===');
    console.log('Inquiry ID:', params.id);
    
    const session = await getServerSession(authOptions);
    console.log('Session user ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const validatedData = respondSchema.parse(body);
    console.log('Validated data:', validatedData);

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

    console.log('Found inquiry:', inquiry ? 'Yes' : 'No');
    if (inquiry) {
      console.log('Inquiry property owner ID:', inquiry.property.ownerId);
      console.log('Current user ID:', session.user.id);
      console.log('Inquiry has conversation:', !!inquiry.conversation);
    }

    if (!inquiry) {
      console.log('Inquiry not found');
      return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });
    }

    // Check if the current user is the property owner
    if (inquiry.property.ownerId !== session.user.id) {
      console.log('User not authorized - not property owner');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Create or get conversation
    let conversation = inquiry.conversation;
    if (!conversation) {
      console.log('Creating new conversation...');
      // Create conversation with propertyId (not inquiryId)
      conversation = await prisma.conversation.create({
        data: {
          propertyId: inquiry.propertyId,
          status: 'ACTIVE',
        },
      });
      console.log('Created conversation with ID:', conversation.id);

      // Create conversation participants
      const participants = [
        {
          conversationId: conversation.id,
          userId: inquiry.property.ownerId,
          role: 'PARTICIPANT',
        },
        ...(inquiry.inquirerId ? [{
          conversationId: conversation.id,
          userId: inquiry.inquirerId,
          role: 'PARTICIPANT',
        }] : []),
      ];
      
      console.log('Creating participants:', participants);
      await prisma.conversationParticipant.createMany({
        data: participants,
      });

      // Update the inquiry to link it to the conversation
      await prisma.propertyInquiry.update({
        where: { id: params.id },
        data: {
          conversationId: conversation.id,
        },
      });
      console.log('Updated inquiry with conversation ID');
    } else {
      console.log('Using existing conversation:', conversation.id);
    }

    // Add the response message with correct message type
    console.log('Creating message...');
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: validatedData.message,
        messageType: 'TEXT', // Use TEXT instead of RESPONSE
      },
    });
    console.log('Created message with ID:', message.id);

    // Update inquiry status
    console.log('Updating inquiry status...');
    await prisma.propertyInquiry.update({
      where: { id: params.id },
      data: {
        status: 'RESPONDED',
      },
    });
    console.log('Updated inquiry status to RESPONDED');

    // Send email notification to inquirer
    try {
      console.log('Attempting to send email notification...');
      const { sendInquiryResponseNotification } = await import('@/lib/email-service');
      await sendInquiryResponseNotification({
        inquirerEmail: inquiry.inquirerEmail,
        inquirerName: inquiry.inquirerName,
        propertyTitle: inquiry.property.title,
        ownerName: inquiry.property.owner.name,
        response: validatedData.message,
      });
      console.log('Email notification sent successfully');
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    console.log('=== INQUIRY RESPONSE API SUCCESS ===');
    return NextResponse.json({
      success: true,
      message: 'Response sent successfully',
      data: { message },
    });

  } catch (error) {
    console.error('=== INQUIRY RESPONSE API ERROR ===');
    console.error('Error responding to inquiry:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
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
