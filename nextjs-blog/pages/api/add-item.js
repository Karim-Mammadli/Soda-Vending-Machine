import connectToMongoDB from '../../mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await connectToMongoDB();
      const { id, name, price, quantity } = req.body;

      // Check if an item with the same ID already exists
      const existingItem = await db.collection('MachineItems').findOne({ id });

      if (existingItem) {
        res.status(400).send({ message: 'Item with the same ID already exists' });
        return;
      }

      // Insert the new item into the machine
      await db.collection('MachineItems').insertOne({ id, name, price, quantity });

      res.status(201).send({ message: 'Item added', item: { id, name, price, quantity } });

    } catch (error) {
      res.status(500).send(error.message);
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
