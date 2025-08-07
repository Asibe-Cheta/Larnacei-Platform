"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PropertiesGrid({ properties: initialProperties }) {
  const [properties, setProperties] = useState(initialProperties);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property? This cannot be undone.")) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      } else {
        setDeleteError(data.message || "Failed to delete property.");
      }
    } catch (err) {
      setDeleteError("Failed to delete property.");
    } finally {
      setDeletingId(null);
    }
  };

  if (properties.length === 0) {
    return <div className="text-center text-gray-500">You have not listed any properties yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {properties.map((property) => {
        // Handle different image data structures
        let imageUrl = '/images/Larnacei_coloured.png'; // Default fallback

        if (property.images && property.images.length > 0) {
          const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
          if (primaryImage) {
            // Handle both string URLs and object structures
            imageUrl = typeof primaryImage === 'string' ? primaryImage : primaryImage.url;
          }
        }

        return (
          <div key={property.id} className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
              {imageUrl.startsWith('blob:') ? (
                <img
                  src={imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              )}
              {property.isFeatured && (
                <span className="absolute top-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded font-bold">Featured</span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg mb-1" style={{ color: '#7C0302' }}>{property.title}</h3>
              <div className="text-sm text-gray-600 mb-2">
                {property.city}, {property.state}
              </div>
              <div className="text-lg font-bold mb-2" style={{ color: '#7C0302' }}>
                {property.currency} {property.price.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded ${property.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {property.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${property.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                  {property.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${property.moderationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : property.moderationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {property.moderationStatus}
                </span>
              </div>
              <div className="mt-auto flex gap-2">
                <Link href={`/properties/${property.id}`} className="btn btn-xs" style={{ background: '#7C0302', color: 'white' }}>View</Link>
                <Link href={`/dashboard/properties/${property.id}/edit`} className="btn btn-xs border border-[#7C0302] text-[#7C0302] bg-white">Edit</Link>
                <button
                  className="btn btn-xs border border-red-600 text-red-700 bg-white"
                  style={{ minWidth: 60 }}
                  onClick={() => handleDelete(property.id)}
                  disabled={deletingId === property.id}
                >
                  {deletingId === property.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              {deleteError && (
                <div className="text-xs text-[#7C0302] mt-2">{deleteError}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 