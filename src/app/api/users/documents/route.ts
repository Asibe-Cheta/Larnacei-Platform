import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { documentType, documentUrl, documentNumber } = await req.json();

    if (!documentType || !documentUrl) {
      return NextResponse.json(
        { error: 'Document type and URL are required' },
        { status: 400 }
      );
    }

    // Check if document type already exists for this user
    const existingDoc = await prisma.verificationDocument.findFirst({
      where: {
        userId: user.id,
        documentType: documentType
      }
    });

    if (existingDoc) {
      // Update existing document
      const updatedDoc = await prisma.verificationDocument.update({
        where: { id: existingDoc.id },
        data: {
          documentUrl,
          documentNumber,
          verificationStatus: 'PENDING',
          verifiedAt: null,
          verifiedBy: null,
          rejectionReason: null,
        }
      });

      return NextResponse.json({
        success: true,
        document: serializeBigInt(updatedDoc),
        message: 'Document updated successfully'
      });
    } else {
      // Create new document
      const newDoc = await prisma.verificationDocument.create({
        data: {
          userId: user.id,
          documentType,
          documentUrl,
          documentNumber,
          verificationStatus: 'PENDING'
        }
      });

      return NextResponse.json({
        success: true,
        document: serializeBigInt(newDoc),
        message: 'Document uploaded successfully'
      });
    }
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const documents = await prisma.verificationDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      documents: serializeBigInt(documents)
    });
  } catch (error: any) {
    console.error('Fetch documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
