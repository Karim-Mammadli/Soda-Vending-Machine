// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  quantity: Number
});

const Item = mongoose.model('Item', itemSchema, 'MachineItems');

module.exports = Item;
