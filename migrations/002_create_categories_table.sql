-- Create categories table
CREATE TABLE categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Insert some common food categories
INSERT INTO categories (name) VALUES
    ('Appetizers'),
    ('Main Course'),
    ('Desserts'),
    ('Beverages'),
    ('Sides'),
    ('Salads'),
    ('Soups'),
    ('Breakfast'),
    ('Lunch Specials'),
    ('Dinner Specials'),
    ('Rolls');

-- Add foreign key constraint to menu_items table
ALTER TABLE menu_items
ADD CONSTRAINT fk_menu_items_category
FOREIGN KEY (category) REFERENCES categories(name);
