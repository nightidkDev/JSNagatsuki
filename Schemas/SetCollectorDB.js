const { Schema, model } = require("mongoose");

module.exports = model(
  "SetCollectorDB",
  new Schema({
    messageID: String,
    channelID: String,
    type: String,
    operate: Boolean,
  })
);
