var ChatUsers = require("../models/chat-users");

module.exports = class User {
  constructor(psid) {
    this.psid = psid;
    this.firstName = "";
    this.lastName = "";
    this.waterCount = 0;
  }
  setProfile(profile) {
    this.firstName = profile.firstName;
    this.lastName = profile.lastName;
  }
  async syncProfile(profile) {
    try {
      let chatUser = await ChatUsers.findOneAndUpdate(
        { psid: this.psid },
        {
          psid: this.psid,
          firstName: profile.firstName,
          lastName: profile.lastName
        },
        { upsert: true }
      ).exec();
      return chatUser;
    } catch (err) {
      console.log("New User Database write failed");
    }
  }
};
