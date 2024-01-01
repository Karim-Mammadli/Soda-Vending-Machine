//connect to mongodb
const { MongoClient } = require('mongodb');

require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function connectToMongoDB() {
    const client = new MongoClient(uri
        // , { useNewUrlParser: true, useUnifiedTopology: true }
        );

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('VendingMachine');
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectToMongoDB;
