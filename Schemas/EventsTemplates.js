const { Schema, model } = require("mongoose");

module.exports = model(
  "EventsTemplatesDB",
  new Schema({
    templateID: String,
    author: String,
    name: String,
    date: String,
    description: String,
    image: String,
    linkRoom: String,
  })
);
