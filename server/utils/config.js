require("dotenv").config();

module.exports = {
  // Messenger API
  graphEndpoint: "https://graph.facebook.com",
  graphVersion: "v3.2",

  // Page and Application information
  pageId: process.env.PAGE_ID,
  appId: process.env.APP_ID,
  pageAccesToken: process.env.PAGE_ACCESS_TOKEN,
  appSecret: process.env.APP_SECRET,
  verifyToken: process.env.VERIFY_TOKEN,

  // URL of your app domain
  appUrl: process.env.APP_URL,

  port: process.env.PORT || 3000,

  get webhookUrl() {
    return this.appUrl + "/webhook";
  },
  get graphApiURL() {
    return this.graphEndpoint + "/" + this.graphVersion;
  }
};
