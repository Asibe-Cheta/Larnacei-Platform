import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Send email to info@larnaceiglobal.com
    const emailData = {
      to: 'info@larnaceiglobal.com',
      subject: `Contact Form: ${validatedData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Phone:</strong> ${validatedData.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${validatedData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${validatedData.name}
        Email: ${validatedData.email}
        Phone: ${validatedData.phone || 'Not provided'}
        Subject: ${validatedData.subject}
        
        Message:
        ${validatedData.message}
      `
    };

    // For now, we'll simulate sending the email
    // In production, you would integrate with your email service
    console.log('Contact form submission:', emailData);

    // TODO: Integrate with SendGrid or other email service
    // await sendEmail(emailData);

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!"
    });
  } catch (error: any) {
    console.error("Contact form error:", error);

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