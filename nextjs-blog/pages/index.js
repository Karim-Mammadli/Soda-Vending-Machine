// pages/index.js

import React, { useState } from 'react';


export default function Home() {
  const [sodaId, setSodaId] = useState('');

  const handleBuy = async (event) => {
    event.preventDefault();

    // Here you'd call the purchase API route
    console.log(`Buying soda with ID: ${sodaId}`);

    // For now, we'll just add the item to myItems
    const item = sodas.find(soda => soda.id.toString() === sodaId);
    if (item) {
      setMyItems(prevItems => [...prevItems, item]);
    }
    
    // Reset the sodaId field after the purchase
    setSodaId('');
  };

  // Dummy data for the soda list
  const sodas = [
    { id: 100, name: 'Coca Cola', price: 3.00, quantity: 8 },
    { id: 101, name: 'Pepsi', price: 2.50, quantity: 10 },
    { id: 102, name: 'Fanta', price: 2.50, quantity: 6 },
    { id: 103, name: 'Sprite', price: 2.50, quantity: 9 },
    { id: 104, name: 'Mountain Dew', price: 2.50, quantity: 7 },
    // ... other sodas
  ];

  return (
    <div className="container">
      <div className="vending">
      <h1>Vending Machine</h1>
      <table className="vending-machine">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity Available</th>
          </tr>
        </thead>
        <tbody>
          {sodas.map((soda) => (
            <tr key={soda.id}>
              <td>{soda.id}</td>
              <td>{soda.name}</td>
              <td>${soda.price.toFixed(2)}</td>
              <td>{soda.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleBuy}>
        <input
          type="number"
          placeholder="Enter soda ID"
          value={sodaId}
          onChange={(e) => setSodaId(e.target.value)}
          required
        />
        <button type="submit">Buy</button>
      </form>
      </div>
    </div>
  );
}
