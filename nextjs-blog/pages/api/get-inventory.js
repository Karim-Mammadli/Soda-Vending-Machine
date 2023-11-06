import connectToMongoDB from '../../mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const db = await connectToMongoDB();
      const inventoryItems = await db.collection('Inventory').find({}).toArray();
      res.status(200).json({ inventory: inventoryItems });
    } catch (error) {
      console.error("Error loading inventory:", error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
