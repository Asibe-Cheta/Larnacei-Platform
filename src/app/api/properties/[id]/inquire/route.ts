import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendInquiryNotification, sendInquiryConfirmation } from "@/lib/email-service";

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  preferredContact: z.enum(["WHATSAPP", "PHONE", "EMAIL", "SMS"]),
  inquiryType: z.enum(["GENERAL_INFO", "VIEWING_REQUEST", "PRICE_INQUIRY", "PURCHASE_INTENT", "INVESTMENT_INQUIRY", "OTHER"]),
  intendedUse: z.string().optional(),
  budget: z.string().optional(),
  timeframe: z.string().optional(),
  financingNeeded: z.boolean().default(false),
  requestViewing: z.boolean().default(false),
  viewingDate: z.string().optional(),
  viewingTime: z.string().optional(),
  virtualViewingInterest: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if property exists and is active
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    if (!property.isActive || property.moderationStatus !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Property is not available for inquiries" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    // Check if there's already a conversation between this inquirer and property owner
    let conversation = await prisma.conversation.findFirst({
      where: {
        propertyId: id,
        participants: {
          some: {
            userId: property.owner.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId: id,
          participants: {
            create: [
              {
                userId: property.owner.id,
                role: "PARTICIPANT",
              },
            ],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    // Create inquiry
    const inquiry = await prisma.propertyInquiry.create({
      data: {
        propertyId: id,
        inquirerName: validatedData.name,
        inquirerEmail: validatedData.email,
        inquirerPhone: validatedData.phone,
        message: validatedData.message,
        preferredContactMethod: validatedData.preferredContact,
        inquiryType: validatedData.inquiryType,
        contactPreference: validatedData.preferredContact as any, // Add missing field
        intendedUse: validatedData.intendedUse,
        budget: validatedData.budget ? parseInt(validatedData.budget.replace(/\D/g, '')) : null,
        timeframe: validatedData.timeframe,
        financingNeeded: validatedData.financingNeeded,
        requestViewing: validatedData.requestViewing,
        viewingDate: validatedData.viewingDate ? new Date(validatedData.viewingDate) : null,
        viewingTime: validatedData.viewingTime,
        virtualViewingInterest: validatedData.virtualViewingInterest,
        status: "NEW",
        conversationId: conversation.id,
      },
    });

    // Create initial message in conversation
    const initialMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: property.owner.id, // System message from owner
        content: `New inquiry received from ${validatedData.name}:\n\n${validatedData.message}`,
        messageType: "SYSTEM",
      },
    });

    // Increment inquiry count on property
    await prisma.property.update({
      where: { id },
      data: { inquiryCount: { increment: 1 } },
    });

    // Send email notification to property owner
    await sendInquiryNotification({
      to: property.owner.email,
      propertyTitle: property.title,
      propertyLocation: `${property.city}, ${property.state}`,
      propertyPrice: property.price,
      propertyCurrency: property.currency,
      inquirerName: validatedData.name,
      inquirerEmail: validatedData.email,
      inquirerPhone: validatedData.phone,
      message: validatedData.message,
      preferredContact: validatedData.preferredContact,
      inquiryType: validatedData.inquiryType,
      intendedUse: validatedData.intendedUse,
      budget: validatedData.budget,
      timeframe: validatedData.timeframe,
      financingNeeded: validatedData.financingNeeded,
      requestViewing: validatedData.requestViewing,
      viewingDate: validatedData.viewingDate,
      viewingTime: validatedData.viewingTime,
      virtualViewingInterest: validatedData.virtualViewingInterest,
    });

    // Send confirmation email to inquirer
    await sendInquiryConfirmation({
      to: validatedData.email,
      inquirerName: validatedData.name,
      propertyTitle: property.title,
      propertyLocation: `${property.city}, ${property.state}`,
      propertyPrice: property.price,
      propertyCurrency: property.currency,
      ownerName: property.owner.name || 'Property Owner',
      ownerPhone: property.owner.phone || '',
      ownerEmail: property.owner.email,
    });

    // TODO: Send WhatsApp message if preferred contact is WhatsApp
    if (validatedData.preferredContact === "WHATSAPP" && property.owner.phone) {
      // await sendWhatsAppMessage({
      //   to: property.owner.phone,
      //   message: `New inquiry for your property: ${property.title}\n\nFrom: ${validatedData.name}\nPhone: ${validatedData.phone}\nMessage: ${validatedData.message}`,
      // });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry sent successfully",
        data: {
          inquiryId: inquiry.id,
          conversationId: conversation.id,
          propertyTitle: property.title,
          ownerName: property.owner.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Inquiry creation error:", error);

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
        message: "Failed to send inquiry",
        error: error.message,
      },
      { status: 500 }
    );
  }
} 