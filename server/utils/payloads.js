var Payloads = require("../models/payloads");

module.exports = class PayloadsHelper {
  // Get All payloads
  static async fetchAllPayloads() {
    try {
      let payloads = await Payloads.find({}).exec();
      return payloads;
    } catch (err) {
      console.log("Couldn't fetch payloads");
    }
  }

  static async createPayload(data) {
    try {
      let payload = await Payloads.findOneAndUpdate(
        { payload: data.payload },
        {
          payload: data.payload,
          text: data.text,
          quick_replies: data.quick_replies
        },
        { upsert: true }
      ).exec();
      return payload;
    } catch (err) {
      console.log("New Payload Database write failed");
    }
  }

  // static async fetchUnresolvedPayloads(){

  //     let payloads = await Payloads.find({}).exec();
  //     return payloads
  // }
};
