var ChatUsers = require("../models/chat-users");

module.exports = class User {
  constructor(psid) {
    this.psid = psid;
    this.firstName = "";
    this.lastName = "";
    this.waterCount = 0;
    this.weight = "";
    this.dailyReminder = false;
  }
  setProfile(profile) {
    this.firstName = profile.firstName;
    this.lastName = profile.lastName;
  }
  async syncProfile(profile, extracted = {}) {
    try {
      let chatUser = await ChatUsers.findOneAndUpdate(
        { psid: this.psid },
        {
          psid: this.psid,
          firstName: profile.firstName,
          lastName: profile.lastName,
          $inc: { waterCount: Number(extracted.waterCount || 0) },
          weight: extracted.weight || "",
          dailyReminder: Boolean(extracted.dailyReminder) || false
        },
        { upsert: true }
      ).exec();
      return chatUser;
    } catch (err) {
      console.log("New User Database write failed");
    }
  }
};
