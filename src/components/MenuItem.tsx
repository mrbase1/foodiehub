import React, { useState } from 'react';

interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  created_at: string;
  image_url?: string;
}

interface MenuItemProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

function Modal({ isOpen, onClose, itemName }: { isOpen: boolean; onClose: () => void; itemName: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">Item Added to Cart!</h3>
        <p className="text-gray-600 mb-4">
          {itemName} has been added to your cart. You can adjust the quantity in the cart.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          <a
            href="#cart"
            onClick={() => {
              onClose();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            View Cart
          </a>
        </div>
      </div>
    </div>
  );
}

export function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(item);
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0">
          {(item.image || item.image_url) ? (
            <img
              src={item.image || item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-gray-600 text-sm">{item.description}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-green-600 font-semibold"><span className='naira'>N</span>{item.price}</span>
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        itemName={item.name}
      />
    </div>
  );
}