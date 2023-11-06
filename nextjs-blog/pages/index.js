import React, { useState, useEffect } from "react";
import { BiSort, BiTrash } from "react-icons/bi";
import MyItems from "./my-items";

export default function Home() {
  // const [sodas, setSodas] = useState([]);
  const [sodaId, setSodaId] = useState("");
  const [newItem, setNewItem] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
  });
  const [inventory, setInventory] = useState([]);

  const [sodas, setSodas] = useState([
    // //dummies
    // { id: 100, name: 'Coca Cola', price: 3.00, quantity: 8 },
    // { id: 101, name: 'Pepsi', price: 2.50, quantity: 10 },
    // { id: 102, name: 'Fanta', price: 2.50, quantity: 6 },
    // { id: 103, name: 'Sprite', price: 2.40, quantity: 9 },
    // { id: 104, name: 'Mountain Dew', price: 2.50, quantity: 7 },
  ]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    // Fetch items from the database when the component mounts
    const fetchSodas = async () => {
      try {
        const response = await fetch("/api/get-items"); // Adjust the endpoint as needed
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSodas(data);
      } catch (error) {
        console.error("Failed to fetch items", error);
      }
    };

    fetchSodas();

    const fetchInventory = async () => {
      const response = await fetch("/api/get-inventory");
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
      } else {
        // Handle error response
        const errorData = await response.json();
        console.error("Failed to load inventory:", errorData);
      }
    };

    fetchInventory();
  }, []); // The empty array as a second argument ensures this effect only runs once on mount

  /*    HANDLES     */

  const handleBuy = async (event) => {
    console.log("event is:", event);
    event.preventDefault();

    const response = await fetch("/api/buy-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sodaId }),
    });

    console.log("response is:", response);

    if (response.ok === true) {
      const data = await response.json();

      console.log("data is:", data);
      if (data.item) {
        // Update the sodas state
        if (data.item.quantity === 0) {
          setSodas(sodas.filter((soda) => soda.id !== data.item.id));
        } else {
          setSodas(
            sodas.map((soda) => (soda.id === data.item.id ? data.item : soda))
          );
        }

        //update the inventory state
        console.log("data.inventoryItem is:", data.inventoryItem);

        setInventory((prevInventory) => {
          const existing = prevInventory.find(
            (i) => i.name === data.inventoryItem.name
          );
          if (existing) {
            return prevInventory.map((i) =>
              i.name === data.inventoryItem.name ? data.inventoryItem : i
            );
          }
          return [...prevInventory, data.inventoryItem];
        });
      } else {
        console.error("Failed to buy item1:", data.message);
      }

      // Reset the sodaId field after the purchase
      setSodaId("");
    } else {
      const errorData = await response.json();
      console.error("Failed to buy item:", errorData);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedSodas = React.useMemo(() => {
    let sortableItems = [...sodas];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sodas, sortConfig]);

  const handleAddItem = async (e) => {
    e.preventDefault();

    // Ensure that price and quantity are properly converted to numbers
    const itemToAdd = {
      ...newItem,
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity, 10),
    };

    const response = await fetch("/api/add-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemToAdd),
    });

    if (response.ok) {
      setSodas([...sodas, itemToAdd]);
      setNewItem({ id: "", name: "", price: "", quantity: "" });
    } else {
      console.error("Failed to add item");
    }
  };

  const handleNewItemChange = (e) => {
    let { name, value } = e.target;
    if (name === "price" || name === "quantity") {
      value = value ? parseFloat(value) : "";
    }
    setNewItem({ ...newItem, [name]: value });
    // setNewItem({ ...newItem, [e.target.name]: value });
  };

  const handleDeleteItem = async (id) => {
    const response = await fetch(`/api/delete-item`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      console.error("Failed to delete item");
    } else {
      // Remove the item from the local state to update the UI
      setSodas(sodas.filter((soda) => soda.id !== id));
    }
  };

  return (
    <div className="container">
      <div className="vending">
        <h1>Soda Vending Machine</h1>
        <table className="vending-machine">
          <thead>
            <tr>
              <th>
                ID <BiSort onClick={() => requestSort("id")} />
              </th>
              <th>
                Name <BiSort onClick={() => requestSort("name")} />
              </th>
              <th>
                Price <BiSort onClick={() => requestSort("price")} />
              </th>
              <th>
                Quantity Available{" "}
                <BiSort onClick={() => requestSort("quantity")} />
              </th>
              {/* <th>Actions</th> Added Actions heading */}
              <th>Delete</th> {/* Added Delete heading */}
            </tr>
          </thead>
          <tbody>
            {/* {sodas.map((soda) => ( */}
            {sortedSodas.map((soda) => (
              <tr key={soda.id}>
                <td>{soda.id}</td>
                <td>{soda.name}</td>
                <td>
                  $
                  {typeof soda.price === "number"
                    ? soda.price.toFixed(2)
                    : soda.price}
                </td>
                <td>{soda.quantity}</td>
                {/* <div className="item-actions">
                    <button onClick={() => handleDeleteItem(soda.id)}>Delete</button>
                  </div> */}
                <td>
                  <BiTrash
                    onClick={() => handleDeleteItem(soda.id)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="new-item-form">
          <input
            type="number"
            name="id"
            placeholder="ID"
            value={newItem.id}
            onChange={handleNewItemChange}
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newItem.name}
            onChange={handleNewItemChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newItem.price}
            onChange={handleNewItemChange}
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={handleNewItemChange}
          />

          <button onClick={handleAddItem}>Submit New Item</button>
        </div>

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

      <MyItems inventory={inventory} />
    </div>
  );
}

// const connectToMongoDB = require('../mongodb.js');

// async function testConnection() {
//   const db = await connectToMongoDB();
//   if (db) {
//     console.log('Successfully connected to MongoDB');
//   } else {
//     console.log('Failed to connect to MongoDB');
//   }
// }

// testConnection();
