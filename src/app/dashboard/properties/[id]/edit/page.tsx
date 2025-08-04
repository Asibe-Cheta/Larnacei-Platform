import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import EditPropertyForm from './EditPropertyForm';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Get the property and ensure it belongs to the current user
  const property = await prisma.property.findFirst({
    where: {
      id: params.id,
      ownerId: user.id
    },
    include: {
      images: true,
      videos: true,
      location: true,
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#7C0302' }}>
          Edit Property
        </h1>
        <p className="text-gray-600 mt-2">
          Update your property details and media
        </p>
      </div>

      <EditPropertyForm property={property} />
    </div>
  );
} 