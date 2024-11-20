import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Upload, Link as LinkIcon } from 'lucide-react';

interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  created_at: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export function MenuItems() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageUploadType, setImageUploadType] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    vendor_id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
  });

  const { data: vendors, isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name')
        .returns<Vendor[]>();
      
      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      return data as Category[];
    },
  });

  const { data: menuItems, isLoading: isLoadingMenuItems } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          created_at,
          vendor_id,
          vendors:vendor_id (
            id,
            name
          ),
          category
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching menu items:', error);
        throw error;
      }
      return data;
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('foodiehub')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('foodiehub')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addMenuItemMutation = useMutation({
    mutationFn: async (newMenuItem: Omit<MenuItem, 'id' | 'created_at'>) => {
      if (!newMenuItem.vendor_id) {
        throw new Error('Vendor ID is required');
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          vendor_id: newMenuItem.vendor_id,
          name: newMenuItem.name,
          description: newMenuItem.description,
          price: parseFloat(newMenuItem.price as any),
          category: newMenuItem.category,
          image_url: newMenuItem.image_url
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
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      setIsAddModalOpen(false);
      setFormData({
        vendor_id: '',
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      alert('Failed to add menu item. Please try again.');
    }
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async (updatedItem: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          vendor_id: updatedItem.vendor_id,
          name: updatedItem.name,
          description: updatedItem.description,
          price: parseFloat(updatedItem.price as string),
          category: updatedItem.category,
          image_url: updatedItem.image_url,
        })
        .eq('id', updatedItem.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating menu item:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      setIsEditModalOpen(false);
      setEditingItem(null);
      setSelectedFile(null);
      setFormData({
        vendor_id: '',
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
      });
    },
    onError: (error) => {
      console.error('Failed to update menu item:', error);
      alert('Failed to update menu item. Please try again.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image_url;

      if (imageUploadType === 'file' && selectedFile) {
        // Generate a unique file name
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `menu-items/${fileName}`;

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('foodiehub')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          let errorMessage = 'Failed to upload image.';
          if (uploadError.statusCode === '403') {
            errorMessage += ' Please make sure you are logged in and have permission to upload files.';
          }
          alert(errorMessage);
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('foodiehub')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      const menuItemData = {
        vendor_id: formData.vendor_id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: imageUrl
      };

      console.log('Submitting menu item:', menuItemData);
      addMenuItemMutation.mutate(menuItemData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add menu item. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem) return;

    try {
      let imageUrl = formData.image_url;

      if (imageUploadType === 'file' && selectedFile) {
        // Generate a unique file name
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `menu-items/${fileName}`;

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('foodiehub')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          let errorMessage = 'Failed to upload image.';
          if (uploadError.statusCode === '403') {
            errorMessage += ' Please make sure you are logged in and have permission to upload files.';
          }
          alert(errorMessage);
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('foodiehub')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      const updatedItem = {
        id: editingItem.id,
        vendor_id: formData.vendor_id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image_url: imageUrl,
      };

      updateMenuItemMutation.mutate(updatedItem);
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item. Please try again.');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      vendor_id: item.vendor_id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url,
    });
    setImageUploadType(item.image_url ? 'url' : 'file');
    setIsEditModalOpen(true);
  };

  if (isLoadingMenuItems || isLoadingVendors) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus size={20} /> Add Menu Item
        </button>
      </div>

      {/* Menu Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {menuItems?.map((item: any) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
            <div className="text-sm text-gray-500 mt-2">
              <p>Price: ${item.price}</p>
              <p>Category: {item.category}</p>
              <p>Vendor: {item.vendors.name}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(item)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this menu item?')) {
                    deleteMenuItemMutation.mutate(item.id);
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

      {/* Add Menu Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Menu Item</h2>
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <select
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Select a vendor</option>
                  {vendors?.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setImageUploadType('file')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      imageUploadType === 'file'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Upload size={16} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType('url')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      imageUploadType === 'url'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <LinkIcon size={16} /> External URL
                  </button>
                </div>
                {imageUploadType === 'file' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-blue-500 transition-colors"
                      >
                        {selectedFile ? (
                          <span className="text-blue-500">{selectedFile.name}</span>
                        ) : (
                          <span className="text-gray-500">
                            Click to select an image file
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full border rounded p-2"
                    placeholder="https://example.com/image.jpg"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setSelectedFile(null);
                    setFormData({
                      vendor_id: '',
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      image_url: '',
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Menu Item Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Menu Item</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <select
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Select a vendor</option>
                  {vendors?.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setImageUploadType('file')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      imageUploadType === 'file'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Upload size={16} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType('url')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                      imageUploadType === 'url'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <LinkIcon size={16} /> External URL
                  </button>
                </div>
                {imageUploadType === 'file' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-blue-500 transition-colors"
                      >
                        {selectedFile ? (
                          <span className="text-blue-500">{selectedFile.name}</span>
                        ) : (
                          <span className="text-gray-500">
                            Click to select an image file
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full border rounded p-2"
                    placeholder="https://example.com/image.jpg"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                    setSelectedFile(null);
                    setFormData({
                      vendor_id: '',
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      image_url: '',
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
