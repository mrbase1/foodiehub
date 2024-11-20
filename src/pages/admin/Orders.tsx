import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  vendor_id: string;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered';
  created_at: string;
  payment_reference: string;
  order_items: {
    id: string;
    menu_item: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }[];
  vendor: {
    name: string;
  };
  profiles: {
    full_name: string;
    email: string;
    phone_number: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    delivery_instructions: string;
  };
}

export function Orders() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(name),
          profiles!fk_orders_profiles(
            full_name,
            email,
            phone_number,
            street_address,
            city,
            state,
            postal_code,
            delivery_instructions
          ),
          order_items(
            id,
            quantity,
            price,
            menu_item:menu_items(name, price)
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      return data as Order[];
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      console.log('Updating order:', { orderId, status });
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();
      
      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', selectedStatus] });
    },
  });

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'text-yellow-500',
      confirmed: 'text-blue-500',
      preparing: 'text-blue-500',
      delivering: 'text-green-500',
      delivered: 'text-purple-500',
    };
    return colors[status] || 'text-gray-500';
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="delivering">Delivering</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="grid gap-4">
        {orders?.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                <p className="text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <div className="flex gap-2">
                  {order.status !== 'delivered' && (
                    <>
                      <button
                        onClick={() => {
                          const nextStatus = 
                            order.status === 'pending' ? 'confirmed' :
                            order.status === 'confirmed' ? 'preparing' :
                            order.status === 'preparing' ? 'delivering' :
                            order.status === 'delivering' ? 'delivered' :
                            order.status;
                          
                          console.log('Current status:', order.status, 'Next status:', nextStatus);
                          
                          if (nextStatus !== order.status) {
                            updateOrderStatusMutation.mutate({
                              orderId: order.id,
                              status: nextStatus as Order['status']
                            });
                          }
                        }}
                        className="p-2 text-green-500 hover:bg-green-50 rounded"
                      >
                        <CheckCircle size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <p className="text-gray-600">{order.profiles.full_name}</p>
                  <p className="text-gray-600">{order.profiles.email}</p>
                  <p className="text-gray-600">{order.profiles.phone_number}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <p className="text-gray-600">{order.profiles.street_address}</p>
                  <p className="text-gray-600">{order.profiles.city}, {order.profiles.state} {order.profiles.postal_code}</p>
                  {order.profiles.delivery_instructions && (
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">Instructions: </span>
                      {order.profiles.delivery_instructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Vendor</h4>
                <p className="text-gray-600">{order.vendor.name}</p>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="space-y-2">
                  {order.order_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-gray-600"
                    >
                      <span>
                        {item.quantity}x {item.menu_item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
