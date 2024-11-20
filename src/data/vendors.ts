export const vendors = [
  {
    id: '1',
    name: 'Sushi Master',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    cuisine: 'Japanese',
    deliveryTime: '25-35',
    minimumOrder: 15,
  },
  {
    id: '2',
    name: 'Burger House',
    image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    cuisine: 'American',
    deliveryTime: '20-30',
    minimumOrder: 10,
  },
  {
    id: '3',
    name: 'Pizza Roma',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    cuisine: 'Italian',
    deliveryTime: '30-40',
    minimumOrder: 12,
  },
];

export const menuItems = [
  {
    id: '1',
    vendorId: '1',
    name: 'California Roll',
    description: 'Crab, avocado, cucumber wrapped in seaweed and rice',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=800',
    category: 'Rolls',
  },
  {
    id: '2',
    vendorId: '1',
    name: 'Salmon Nigiri',
    description: 'Fresh salmon over pressed vinegared rice',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&q=80&w=800',
    category: 'Nigiri',
  },
  {
    id: '3',
    vendorId: '2',
    name: 'Classic Cheeseburger',
    description: 'Beef patty, cheddar cheese, lettuce, tomato, special sauce',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
    category: 'Burgers',
  },
  {
    id: '4',
    vendorId: '3',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella, basil, olive oil',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=800',
    category: 'Pizzas',
  },
];