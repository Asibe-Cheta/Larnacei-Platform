import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const conversationFilterSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default("10"),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED", "all"]).optional(),
  propertyId: z.string().optional(),
  sortBy: z.enum(["updatedAt", "createdAt"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedParams = conversationFilterSchema.parse(queryParams);

    // Build where clause
    const where: any = {
      participants: {
        some: {
          userId: userId,
        },
      },
    };

    if (validatedParams.status && validatedParams.status !== "all") {
      where.status = validatedParams.status;
    }

    if (validatedParams.propertyId) {
      where.propertyId = validatedParams.propertyId;
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Build order by
    const orderBy: any = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

    // Fetch conversations with pagination
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              city: true,
              state: true,
              price: true,
              currency: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy,
        skip,
        take: validatedParams.limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / validatedParams.limit);
    const hasNext = validatedParams.page < totalPages;
    const hasPrev = validatedParams.page > 1;

    // Get unread message counts for each conversation
    const conversationsWithUnreadCounts = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            isRead: false,
            senderId: { not: userId },
          },
        });

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "Conversations fetched successfully",
        data: conversationsWithUnreadCounts,
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
    console.error("Conversations fetch error:", error);
    
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
        message: "Failed to fetch conversations",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { propertyId, participantIds, initialMessage } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one participant is required" },
        { status: 400 }
      );
    }

    // Verify user has access to the property (either as owner or participant)
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        OR: [
          { ownerId: userId },
          {
            inquiries: {
              some: {
                inquirerId: userId,
              },
            },
          },
        ],
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found or access denied" },
        { status: 404 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        propertyId,
        participants: {
          every: {
            userId: { in: [userId, ...participantIds] },
          },
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation already exists",
          data: { conversationId: existingConversation.id },
        },
        { status: 409 }
      );
    }

    // Create conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        propertyId,
        participants: {
          create: [
            { userId, role: "PARTICIPANT" },
            ...participantIds.map((participantId: string) => ({
              userId: participantId,
              role: "PARTICIPANT",
            })),
          ],
        },
        ...(initialMessage && {
          messages: {
            create: {
              content: initialMessage,
              senderId: userId,
              messageType: "TEXT",
            },
          },
        }),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Conversation created successfully",
        data: conversation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Conversation creation error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create conversation",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 