import connectToMongoDB from '../../mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await connectToMongoDB();
      const { id, name, price, quantity } = req.body;

      await db.collection('MachineItems').insertOne({ id, name, price, quantity });

      res.status(201).send({ message: 'Item added' });

    } catch (error) {
      res.status(500).send(error.message);
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
