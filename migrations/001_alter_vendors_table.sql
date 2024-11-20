-- Add address and phone columns to vendors table
ALTER TABLE vendors
ADD COLUMN address text,
ADD COLUMN phone text;
