var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ChatUsersSchema = new Schema({
  psid: { type: String, unique: true },
  firstName: String,
  lastName: String,
  waterCount: Number
});

module.exports = mongoose.model("ChatUsers", ChatUsersSchema);
