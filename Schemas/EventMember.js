const { Schema, model } = require("mongoose");

module.exports = model(
  "EventMembersDB",
  new Schema({
    member: String,
    date: Number,
    events: [],
    score: Number,
  })
);
