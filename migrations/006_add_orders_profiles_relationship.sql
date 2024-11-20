-- Add foreign key constraint to link orders with profiles
ALTER TABLE orders
ADD CONSTRAINT fk_orders_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(user_id)
ON DELETE CASCADE;
