import { useState, useEffect } from 'react';
import { Search, ChevronLeft, UserCircle } from 'lucide-react';
import { VendorCard } from './VendorCard';
import { MenuItem as MenuItemComponent } from './MenuItem';
import { Cart } from './Cart';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { CartItem } from '../types';
import { CustomerAuth } from './CustomerAuth';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export function CustomerLayout() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vendors')
        .select('*')
        .order('name');
      return (data || []) as Vendor[];
    },
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items', selectedVendor?.id],
    queryFn: async () => {
      if (!selectedVendor) return [];
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', selectedVendor.id)
        .order('category');
      return (data || []) as MenuItem[];
    },
    enabled: !!selectedVendor,
  });

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: MenuItem) => {
    if (!selectedVendor) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, {
        ...item,
        vendorId: selectedVendor.id,
        quantity: 1,
        // Map database fields to CartItem fields
        image: item.image || '',
        price: item.price || 0,
      }];
    });
  };

  const handleUpdateQuantity = (itemId: string, change: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/src/assets/fhublogo-cropped.png" alt="FoodieHub Logo" className="h-8 w-auto" />
            <h1 className="text-2xl font-bold text-gray-900">FoodieHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => !user && setShowAuth(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <UserCircle className="w-6 h-6" />
              <span>{user ? user.email : 'Sign In'}</span>
            </button>
            {user && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuth && <CustomerAuth onClose={() => setShowAuth(false)} />}

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {selectedVendor && (
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => setSelectedVendor(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Vendors
            </button>
            <h2 className="text-xl font-semibold">{selectedVendor.name}</h2>
          </div>
        )}
        {!selectedVendor && (
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vendors or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {selectedVendor ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={selectedVendor.image}
                    alt={selectedVendor.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-bold">{selectedVendor.name}</h2>
                    <p className="text-gray-600">{selectedVendor.cuisine}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {menuItems.map(item => (
                    <MenuItemComponent
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVendors.map(vendor => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onClick={setSelectedVendor}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Cart
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}