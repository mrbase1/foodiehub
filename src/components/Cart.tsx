import { useState, useEffect } from 'react';
import { ShoppingBag, Minus, Plus, X } from 'lucide-react';
import { CartItem } from '../types';
import { usePaystackPayment } from 'react-paystack';
import { supabase } from '../lib/supabase';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, change: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUserEmail(userData?.user?.email || '');
    };

    fetchUserEmail();
    const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(calculatedTotal);
  }, [items]);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: userEmail,
    amount: Math.round(total * 100), // Paystack amount is in kobo
    publicKey: 'pk_live_ff9089dada6bf86db3c082672f8da182fa0c2ff9', // Replace with your Paystack public key
    currency: 'NGN',
  };

  const onSuccess = (reference: any) => {
    saveOrder(reference);
  };

  const onClose = () => {
    console.log('Payment closed');
  };

  const saveOrder = async (reference: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Insert the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.user.id,
          vendor_id: items[0]?.vendorId, // Assuming all items are from the same vendor
          status: 'pending',
          total: total,
          payment_reference: reference.reference,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  const initializePayment = usePaystackPayment(config);

  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Your Order</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-gray-600 text-sm">₦{item.price.toFixed(2)} × {item.quantity}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateQuantity(item.id, -1)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-1 rounded-full hover:bg-gray-100 text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">₦{total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => {
            const checkUser = async () => {
              const { data: userData } = await supabase.auth.getUser();
              if (!userData?.user) {
                alert('Please sign in to proceed with checkout');
                return;
              }
              initializePayment({ onSuccess, onClose });
            };
            checkUser();
          }}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}