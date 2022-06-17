const { Schema, model } = require("mongoose");

module.exports = model(
  "SponsorsDB",
  new Schema({
    member: String,
    time: Number,
    timeGive: Number,
  })
);
