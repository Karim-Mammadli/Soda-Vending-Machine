
import connectToMongoDB from '../../mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const db = await connectToMongoDB();
      const items = await db.collection('MachineItems').find({}).toArray(); // Fetch all items
      res.status(200).json(items);
    } catch (error) {
      res.status(500).send(error.message);
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
