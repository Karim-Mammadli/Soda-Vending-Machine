import React, { useState, useEffect } from "react";
import { BiSort, BiTrash } from "react-icons/bi";
import MyItems from "./my-items";
// import "./NewItemForm.css";

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

  // State for the item currently being edited
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
  });

  // filtering state
  const [filterRange, setFilterRange] = useState({ min: 0, max: 0 });
  const [filteredSodas, setFilteredSodas] = useState([]);

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
  }, []); // ensures this effect only runs once on mount

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

    // Check if quantity is greater than 0 before making the API call
    if (itemToAdd.quantity <= 0) {
      console.error("Quantity must be greater than 0.");

      return;
    }

    const response = await fetch("/api/add-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemToAdd),
    });

    if (response.ok) {
      const responseData = await response.json();

      if (responseData.message === "Item added") {
        setSodas([...sodas, itemToAdd]);
        setNewItem({ id: "", name: "", price: "", quantity: "" });
      } else {
        console.error("Failed to add item:", responseData.message);
      }
    } else if (response.status === 400) {
      const responseData = await response.json();
      console.error("Same ID Item Already Exists");
    } else {
      console.error("Failed to add item. Server error.");
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

  // Handle form data changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Handle the submission of the edit form
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();

    // Ensure that price and quantity are numbers
    const editedItem = {
      ...editFormData,
      price: parseFloat(editFormData.price),
      quantity: parseInt(editFormData.quantity, 10),
    };

    // Send PUT request to the server
    const response = await fetch("/api/edit-item", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedItem),
    });

    if (response.ok) {
      // Update the UI accordingly
      setSodas(
        sodas.map((soda) => {
          if (soda.id === editedItem.id) return editedItem;
          else return soda;
        })
      );
      // Reset the edit form
      setEditFormData({ id: "", name: "", price: "", quantity: "" });
    } else {
      console.error("Failed to edit item");
    }
  };

  // Handle the change of the filter range input
  const handleFilterRangeChange = (e) => {
    const range = e.target.value.split("-").map(Number);
    setFilterRange({ min: range[0], max: range[1] });
  };

  // Function to filter sodas based on price range
  const handleFilterSodas = () => {
    const filtered = sodas.filter((soda) => {
      return soda.price >= filterRange.min && soda.price <= filterRange.max;
    });
    setFilteredSodas(filtered);
  };

  return (
    <>
      {/* center this div */}
      <div
      // style={{
      //   display: "flex",
      //   justifyContent: "center",
      //   alignItems: "center",
      //   height: "100vh",
      // }}
      >
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
                    {/* <button onClick={() => handleEditItem(soda)}>Edit</button>{" "} */}
                    {/* Add this button */}
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
                      {/* <button onClick={() => handleEditItem(soda)}>Edit</button>{" "} */}
                      {/* Add this */}
                      <BiTrash
                        onClick={() => handleDeleteItem(soda.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <br />

            {/* INPUT FIELDS START HERE */}

            <div className="new-item-form-container">
              <form className="new-item-form">
                <label>
                  ID:
                  {/* give horizontal space */}
                  &nbsp;
                  <input
                    type="number"
                    name="id"
                    placeholder="ID"
                    value={newItem.id}
                    onChange={handleNewItemChange}
                  />
                </label>

                <label>
                  Name: &nbsp;
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={newItem.name}
                    onChange={handleNewItemChange}
                  />
                </label>

                <label>
                  Price: &nbsp;
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={handleNewItemChange}
                  />
                </label>

                <label>
                  Quantity: &nbsp;
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={handleNewItemChange}
                  />
                </label>
              </form>

              <button className="addButton" onClick={handleAddItem}>
                Add New Item
              </button>
            </div>
          </div>

          <br />

          {/* BUYING FORM */}

          <div>
            <form onSubmit={handleBuy}>
              <input
                type="number"
                placeholder="Enter soda ID"
                value={sodaId}
                onChange={(e) => setSodaId(e.target.value)}
                required
              />
              <button type="submit">Purchase</button>
            </form>
          </div>

          <br />

          {/* EDITING FORM */}
          <div className="edit-item-form">
            <form onSubmit={handleEditFormSubmit}>
              <input
                type="number"
                name="id"
                placeholder="ID"
                value={editFormData.id}
                onChange={handleEditFormChange}
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editFormData.name}
                onChange={handleEditFormChange}
              />
              <input
                type="number"
                step="0.01"
                name="price"
                placeholder="Price"
                value={editFormData.price}
                onChange={handleEditFormChange}
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={editFormData.quantity}
                onChange={handleEditFormChange}
              />
              <button type="submit">Edit</button>
            </form>
          </div>

          {/* some vertical space  */}
          <br />
          {/* FILTERING FORM */}

          <div className="filter-section">
            <input
              type="text"
              placeholder="Price Range (2.2-2.7)"
              onChange={handleFilterRangeChange}
            />
            <button onClick={handleFilterSodas}>Filter</button>
          </div>

          {/* Table to display filtered sodas with the same styling as the vending machine table */}
          {filteredSodas.length > 0 && (
            <div className="vend">
              <h2>Filtered Items</h2>
              <table className="vend-machine">
                {" "}
                {/* Reuse the class from the main table */}
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity Available</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSodas.map((soda) => (
                    <tr key={soda.id}>
                      <td>{soda.id}</td>
                      <td>{soda.name}</td>
                      <td>${soda.price.toFixed(2)}</td>
                      <td>{soda.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <MyItems inventory={inventory} />

          {/* add 1 more row about the total price of items listed */}
        </div>
      </div>
    </>
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
