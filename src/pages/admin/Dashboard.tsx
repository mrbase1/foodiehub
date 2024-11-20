import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, ShoppingBag, DollarSign, Store, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [vendors, orders, revenue] = await Promise.all([
        supabase.from('vendors').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('orders').select('total').eq('status', 'delivered'),
      ]);

      const totalRevenue = revenue.data?.reduce((sum, order) => sum + order.total, 0) || 0;

      return {
        vendors: vendors.count || 0,
        orders: orders.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const cards = [
    {
      title: 'Total Vendors',
      value: stats?.vendors || 0,
      icon: Store,
      color: 'bg-blue-500',
      link: '/admin/vendors',
    },
    {
      title: 'Menu Items',
      value: '...',
      icon: Menu,
      color: 'bg-orange-500',
      link: '/admin/menu-items',
    },
    {
      title: 'Total Orders',
      value: stats?.orders || 0,
      icon: ShoppingBag,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} text-white p-6 rounded-lg shadow hover:opacity-90 transition-opacity ${
              card.link ? 'cursor-pointer' : ''
            }`}
          >
            {card.link ? (
              <Link to={card.link} className="block">
                <CardContent card={card} />
              </Link>
            ) : (
              <CardContent card={card} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardContent({ card }: { card: any }) {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90">{card.title}</p>
          <p className="text-2xl font-bold mt-2">{card.value}</p>
        </div>
        <card.icon size={24} className="opacity-80" />
      </div>
    </>
  );
}