import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import EditPropertyForm from './EditPropertyForm';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      redirect('/auth/signin');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      redirect('/auth/signin');
    }

    // Get property with all related data
    const property = await prisma.property.findFirst({
      where: {
        id: params.id,
        ownerId: user.id
      },
      include: {
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true,
          }
        },
        videos: {
          select: {
            id: true,
            url: true,
            alt: true,
          }
        },
        location: true,
      },
    });

    if (!property) {
      notFound();
    }

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#7C0302' }}>Edit Property</h1>
          <p className="text-gray-600 mt-2">Update your property details and media</p>
        </div>
        <EditPropertyForm property={property} />
      </div>
    );
  } catch (error) {
    console.error('Error in EditPropertyPage:', error);
    throw new Error('Failed to load property for editing');
  }
} 