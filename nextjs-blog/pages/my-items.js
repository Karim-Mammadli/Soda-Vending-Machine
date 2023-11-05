// pages/my-items.js

import React from 'react';

export default function MyItems() {
  // This would be fetched from the API or database in a full implementation
  const myPurchases = [
    { name: 'Coca Cola', quantity: 2 },
    { name: 'Pepsi', quantity: 1 },
    // ... other items
  ];

  return (
    <div className="container">
      <h1>My Items</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {myPurchases.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
