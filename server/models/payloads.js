const mongoose = require("mongoose");

var Schema = mongoose.Schema;
var PayloadSchema = new Schema({
  reply_type: { type: String, unique: true },
  text: String,
  quick_replies: [
    {
      title: String,
      payload: String
    }
  ]
});
// JUST ADDS 'S TO THE END, REALLY "SMART" FEATURE
module.exports = mongoose.model("payload", PayloadSchema, "payloads");
