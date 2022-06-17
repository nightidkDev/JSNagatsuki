const { Schema, model } = require("mongoose");

module.exports = model(
  "EventsLiveDB",
  new Schema({
    eventMember: String,
    name: String,
    date: Number,
    description: String,
    image: String,
    members: [],
    linkRoom: String,
    visit: Number,
    publish: Boolean,
  })
);
