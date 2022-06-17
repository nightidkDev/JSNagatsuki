const { Schema, model } = require("mongoose");

module.exports = model(
  "mutesDB",
  new Schema({
    member: String,
    time: Number,
    mod: String,
    reason: String,
  })
);
