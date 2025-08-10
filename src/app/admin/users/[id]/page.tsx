'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  verificationLevel: string;
  role: string;
  bio?: string;
  location?: string;
  experience?: number;
  specialization?: string[];
  _count?: {
    properties?: number;
    inquiries?: number;
    payments?: number;
  };
}

interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserDetailPage({ params }: UserPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [params.id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error(data.error || 'Failed to fetch user details');
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setError(error.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!user) return;

    try {
      setIsVerifying(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${user.id}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh user data
        await fetchUserDetail();
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying user:', error);
      setError(error.message || 'Failed to verify user');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDocumentAction = async (documentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update document status: ${response.status}`);
      }

      // Refresh user data to get updated document status
      fetchUser();
    } catch (error) {
      console.error('Error updating document status:', error);
      setError('Failed to update document status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/admin/users')} variant="outline">
            ← Back to Users
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-800">
            User not found
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/admin/users')} variant="outline">
            ← Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => router.push('/admin/users')} 
          variant="outline" 
          className="mb-4"
        >
          ← Back to Users
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-2">{user.name || user.email}</p>
          </div>
          <div className="flex space-x-3">
            {!user.isVerified && (
              <Button 
                onClick={handleVerifyUser}
                disabled={isVerifying}
                className="bg-green-600 hover:bg-green-700"
              >
                {isVerifying ? 'Verifying...' : 'Verify User'}
              </Button>
            )}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.isVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.isVerified ? 'Verified' : 'Unverified'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>User account details and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 mt-1">{user.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900 mt-1">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900 mt-1 capitalize">{user.role?.toLowerCase() || 'User'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900 mt-1">{user.location || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Verification Level</label>
                  <p className="text-gray-900 mt-1">{user.verificationLevel || 'Basic'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Experience</label>
                  <p className="text-gray-900 mt-1">
                    {user.experience ? `${user.experience} years` : 'Not provided'}
                  </p>
                </div>
              </div>

              {(user.bio || user.specialization) && (
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                  {user.bio && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700">Bio</label>
                      <p className="text-gray-900 mt-1">{user.bio}</p>
                    </div>
                  )}
                  {user.specialization && user.specialization.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Specialization</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {user.specialization.map((spec, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verification Documents */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
              <CardDescription>User uploaded identity documents</CardDescription>
            </CardHeader>
            <CardContent>
              {user.verificationDocs && user.verificationDocs.length > 0 ? (
                <div className="space-y-4">
                  {user.verificationDocs.map((doc: any) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {doc.documentType.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verificationStatus}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {doc.documentNumber && (
                        <p className="text-sm text-gray-600 mb-2">
                          Number: {doc.documentNumber}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          View Document
                        </a>
                        {doc.verificationStatus === 'PENDING' && (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleDocumentAction(doc.id, 'APPROVED')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDocumentAction(doc.id, 'REJECTED')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                      {doc.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2">
                          Rejection reason: {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No verification documents uploaded yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>User engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {user._count?.properties || 0}
                </div>
                <p className="text-sm text-gray-600">Properties Listed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user._count?.inquiries || 0}
                </div>
                <p className="text-sm text-gray-600">Inquiries Made</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {user._count?.payments || 0}
                </div>
                <p className="text-sm text-gray-600">Payments Made</p>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
