export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string;
          name: string;
          image: string;
          rating: number;
          cuisine: string;
          delivery_time: string;
          minimum_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>;
      };
      menu_items: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          description: string;
          price: number;
          image: string;
          category: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          vendor_id: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered';
          total: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
  };
}