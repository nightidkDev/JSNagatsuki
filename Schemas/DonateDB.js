const { Schema, model } = require("mongoose");

module.exports = model(
  "DonateDB",
  new Schema({
    member: String,
    time: Number,
    uid: String,
    amountRubles: Number,
    amountStamps: Number,
    channelID: String,
    messageID: String,
  })
);
