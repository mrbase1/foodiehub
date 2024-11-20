import React from 'react';
import { Database } from '../types/supabase';
import { Clock, DollarSign, Star } from 'lucide-react';

type Vendor = Database['public']['Tables']['vendors']['Row'];

interface VendorCardProps {
  vendor: Vendor;
  onClick: (vendor: Vendor) => void;
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(vendor)}
    >
      <img
        src={vendor.image}
        alt={vendor.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{vendor.name}</h3>
        <p className="text-gray-600">{vendor.cuisine}</p>
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{vendor.rating}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{vendor.delivery_time}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>Min N{vendor.minimum_order}</span>
          </div>
        </div>
      </div>
    </div>
  );
}