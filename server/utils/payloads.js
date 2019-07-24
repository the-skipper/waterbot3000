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
      let payloaddata = data.quick_response
        ? {
            payload: data.payload,
            text: data.text,
            quick_response: data.quick_response
          }
        : {
            payload: data.payload,
            text: data.text
          };
      let payload = await Payloads.findOneAndUpdate(
        { payload: data.payload },
        payloaddata,
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
