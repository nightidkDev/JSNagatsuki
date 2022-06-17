const { Schema, model } = require("mongoose");

module.exports = model(
  "ShopDB",
  new Schema({
    name: String,
    uid: String,
    description: String,
    price: Number,
    type: String,
    category: String,
  })
);
