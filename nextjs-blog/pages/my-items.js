import React from 'react';

const MyItems = ({ inventory }) => {
    console.log("inventory is: ", inventory);
  return (
    <div className="inventory">
      <h2>My Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity Bought</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyItems;
