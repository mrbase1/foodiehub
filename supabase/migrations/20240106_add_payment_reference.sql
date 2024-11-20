-- Add payment_reference column to orders table
ALTER TABLE orders ADD COLUMN payment_reference TEXT;
