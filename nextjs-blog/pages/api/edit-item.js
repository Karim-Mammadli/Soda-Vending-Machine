// api/edit-item.js
const connectToDatabase = require("../../mongodb");

export default async function handler(req, res) {
  console.log("WASSUP req.method is:", req.method);
  if (req.method === "PUT") {
    console.log("IS IT IN IF:");
    try {
      const db = await connectToDatabase();
      const { id, name, price, quantity } = req.body;

      // Convert the id to the appropriate type if necessary (e.g., string, number, ObjectId)
      //   const itemId = parseInt(id);
      const itemId = id;
      console.log("itemId is:", itemId);

      const result = await db.collection("MachineItems").updateOne(
        { id: itemId },
        {
          $set: { name, price, quantity },
        }
      );
      console.log("result is:", result);

      if (result.modifiedCount === 1) {
        res.status(200).json({ message: "Item updated" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
