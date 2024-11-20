-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    cuisine TEXT NOT NULL,
    delivery_time TEXT NOT NULL,
    minimum_order DECIMAL(10,2) NOT NULL CHECK (minimum_order >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_vendors_cuisine ON public.vendors(cuisine);
CREATE INDEX idx_menu_items_vendor ON public.menu_items(vendor_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_vendor ON public.orders(vendor_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create security policies

-- Vendors policies
CREATE POLICY "Allow public read access to vendors"
    ON public.vendors FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow admin to manage vendors"
    ON public.vendors FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@admin.com');

-- Menu items policies
CREATE POLICY "Allow public read access to menu items"
    ON public.menu_items FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow admin to manage menu items"
    ON public.menu_items FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@admin.com');

-- Orders policies
CREATE POLICY "Allow users to view their own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create their own orders"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin to manage all orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@admin.com');

-- Order items policies
CREATE POLICY "Allow users to view their own order items"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to create their own order items"
    ON public.order_items FOR INSERT
    TO authenticated
    WITH CHECK (
        order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow admin to manage all order items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@admin.com');

-- Sample data for testing
INSERT INTO public.vendors (name, image, rating, cuisine, delivery_time, minimum_order) VALUES
    ('Sushi Master', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800', 4.8, 'Japanese', '25-35', 15),
    ('Burger House', 'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=800', 4.5, 'American', '20-30', 10),
    ('Pizza Roma', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800', 4.7, 'Italian', '30-40', 12);

-- Insert sample menu items (after running vendor inserts and getting their IDs)
INSERT INTO public.menu_items (vendor_id, name, description, price, image, category) 
SELECT 
    id as vendor_id,
    'California Roll',
    'Crab, avocado, cucumber wrapped in seaweed and rice',
    12.99,
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=800',
    'Rolls'
FROM public.vendors WHERE name = 'Sushi Master';