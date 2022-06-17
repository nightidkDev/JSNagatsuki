const { Schema, model } = require("mongoose");

module.exports = model(
  "BannerDB",
  new Schema({
    messages: Number,
    date: Number,
  })
);
