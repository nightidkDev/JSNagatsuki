const { Schema, model } = require("mongoose");

module.exports = model(
  "usersDB",
  new Schema({
    userID: String,
    voiceJoinAt: Number,
    voiceState: Number,
    voiceTime: Number,
    messages: Number,
    warns: Array,
    warnsHistory: Array,
    currency: Object,
    level: Number,
    nowXP: Number,
    needXP: Number,
    family: Object,
    clan: Number,
    inventory: Array,
    stats: Object,
  })
);
