import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  delivery_time: string;
  minimum_order: number;
  created_at: string;
  address?: string;
  phone?: string;
}

export function Vendors() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    rating: 0,
    cuisine: '',
    delivery_time: '',
    minimum_order: 0,
    address: '',
    phone: ''
  });

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }
      return data as Vendor[];
    },
  });

  const addVendorMutation = useMutation({
    mutationFn: async (newVendor: Omit<Vendor, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          name: newVendor.name,
          image: newVendor.image,
          rating: newVendor.rating,
          cuisine: newVendor.cuisine,
          delivery_time: newVendor.delivery_time,
          minimum_order: newVendor.minimum_order,
          address: newVendor.address,
          phone: newVendor.phone
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        image: '',
        rating: 0,
        cuisine: '',
        delivery_time: '',
        minimum_order: 0,
        address: '',
        phone: ''
      });
    },
    onError: (error) => {
      console.error('Failed to add vendor:', error);
      alert('Failed to add vendor. Please try again.');
    }
  });

  const editVendorMutation = useMutation({
    mutationFn: async (updatedVendor: Vendor) => {
      const { data, error } = await supabase
        .from('vendors')
        .update({
          name: updatedVendor.name,
          image: updatedVendor.image,
          rating: updatedVendor.rating,
          cuisine: updatedVendor.cuisine,
          delivery_time: updatedVendor.delivery_time,
          minimum_order: updatedVendor.minimum_order,
          address: updatedVendor.address,
          phone: updatedVendor.phone
        })
        .eq('id', updatedVendor.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsEditModalOpen(false);
      setEditingVendor(null);
    },
    onError: (error) => {
      console.error('Failed to update vendor:', error);
      alert('Failed to update vendor. Please try again.');
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVendorMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      editVendorMutation.mutate(editingVendor);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus size={20} /> Add Vendor
        </button>
      </div>

      {/* Vendors List */}
      <div className="grid gap-4">
        {vendors?.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">{vendor.name}</h3>
              <p className="text-gray-600">{vendor.cuisine}</p>
              <div className="text-sm text-gray-500">
                <p>Rating: {vendor.rating}</p>
                <p>Delivery Time: {vendor.delivery_time}</p>
                <p>Minimum Order: ${vendor.minimum_order}</p>
                {vendor.address && <p>{vendor.address}</p>}
                {vendor.phone && <p>{vendor.phone}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingVendor(vendor);
                  setIsEditModalOpen(true);
                }}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this vendor?')) {
                    deleteVendorMutation.mutate(vendor.id);
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Vendor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cuisine</label>
                <input
                  type="text"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Time (e.g., "20-30")</label>
                <input
                  type="text"
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimum_order}
                  onChange={(e) => setFormData({ ...formData, minimum_order: parseFloat(e.target.value) })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {isEditModalOpen && editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Vendor</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingVendor.image}
                  onChange={(e) => setEditingVendor({ ...editingVendor, image: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cuisine</label>
                <input
                  type="text"
                  value={editingVendor.cuisine}
                  onChange={(e) => setEditingVendor({ ...editingVendor, cuisine: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editingVendor.rating}
                  onChange={(e) => setEditingVendor({ ...editingVendor, rating: parseFloat(e.target.value) })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Time (e.g., "20-30")</label>
                <input
                  type="text"
                  value={editingVendor.delivery_time}
                  onChange={(e) => setEditingVendor({ ...editingVendor, delivery_time: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingVendor.minimum_order}
                  onChange={(e) => setEditingVendor({ ...editingVendor, minimum_order: parseFloat(e.target.value) })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={editingVendor.address}
                  onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingVendor.phone}
                  onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
