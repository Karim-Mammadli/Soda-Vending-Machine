const connectToDatabase = require('../../mongodb');

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      const db = await connectToDatabase();
      const { id } = req.body;

      //parametrized query
      const result = await db.collection('MachineItems').deleteOne({ id });

      if (result.deletedCount === 1) {
        res.status(200).send({ message: 'Item deleted' });
      } else {
        res.status(404).send({ message: 'Item not found' });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}