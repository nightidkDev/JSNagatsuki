const { Schema, model } = require("mongoose");

module.exports = model(
  "DonateSponsorDB",
  new Schema({
    member: String,
    time: Number,
    uid: String,
    amountRubles: Number,
    channelID: String,
    messageID: String,
  })
);
