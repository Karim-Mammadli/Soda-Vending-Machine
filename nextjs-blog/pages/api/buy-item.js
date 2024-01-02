import connectToMongoDB from "../../mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const db = await connectToMongoDB();
      const { id } = req.body;

      console.log("Requested ID:", id);

      //first find the item
      const item = await db.collection("MachineItems").findOne({ id });
      if (!item) {
        res.status(404).send({ message: "Item not found" });
        return;
      }

      if (item.quantity === 0) {
        return res.status(400).send({ message: "Item out of stock" });
      }

      console.log("findOneAndUpdate result:", item);

      const updatedItem = await db
        .collection("MachineItems")
        .findOneAndUpdate(
          { id },
          { $inc: { quantity: -1 } },
          { returnDocument: "after" }
        );

      console.log("updatedItem is:", updatedItem);
      console.log("updatedItem.quantity is:", updatedItem.quantity);

      // Check if the updated quantity is 0, and delete the item
      if (updatedItem.quantity === 0) {
        await db.collection("MachineItems").deleteOne({ id });
        console.log("Item deleted from the database");
      }

      const inventoryItem = await db
        .collection("Inventory")
        .findOneAndUpdate(
          { name: item.name },
          { $inc: { quantity: 1 } },
          { upsert: true, returnDocument: "after" }
        );

      console.log("inventoryItem is:", inventoryItem);
      console.log("inventoryItemValue is:", inventoryItem.value);

      res.status(200).send({
        message: "Item bought",
        item: updatedItem,
        inventoryItem: inventoryItem,
      });
    } catch (error) {
      console.error("Error processing the purchase:", error);
      res.status(500).json({ message: error.message });
    }
  } else {
    // res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
