const { Schema, model } = require("mongoose");

module.exports = model(
  "rolesDB",
  new Schema({
    member: String,
    roles: Array,
  })
);
