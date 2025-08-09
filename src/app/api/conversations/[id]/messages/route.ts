import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { z } from "zod";

const messageFilterSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default("20"),
});

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(2000, "Message too long"),
  messageType: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO"]).default("TEXT"),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
  })).optional(),
});

/**
 * GET /api/conversations/[id]/messages
 * Get messages in a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found" },
        { status: 401 }
      );
    }

    // Verify user is a participant in the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedParams = messageFilterSchema.parse(queryParams);

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Fetch messages with pagination
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: validatedParams.limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark messages as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / validatedParams.limit);
    const hasNext = validatedParams.page < totalPages;
    const hasPrev = validatedParams.page > 1;

    return NextResponse.json(
      {
        success: true,
        message: "Messages fetched successfully",
        data: messages.reverse(), // Return in chronological order
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Messages fetch error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          error: error.errors.map((e: any) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch messages",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a new message in a conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found" },
        { status: 401 }
      );
    }

    // Verify user is a participant in the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            ownerId: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: validatedData.content,
        messageType: validatedData.messageType,
        ...(validatedData.attachments && validatedData.attachments.length > 0 && {
          attachments: {
            create: validatedData.attachments,
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attachments: true,
      },
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Send email notifications to other participants
    const otherParticipants = conversation.participants.filter(
      (p) => p.userId !== userId
    );

    // TODO: Send email notifications
    // for (const participant of otherParticipants) {
    //   await sendMessageNotification({
    //     to: participant.user.email,
    //     senderName: session.user.name || 'Someone',
    //     propertyTitle: conversation.property.title,
    //     messagePreview: validatedData.content.substring(0, 100),
    //     conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages/${conversationId}`,
    //   });
    // }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        data: message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Message creation error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: error.errors.map((e: any) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 