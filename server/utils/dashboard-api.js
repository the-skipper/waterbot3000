const GraphAPi = require("./graph-api");
const User = require("./user");

module.exports = class DashboardApi {
  //Message all users from database
  static async messageAllUsers(message) {
    let users = await User.findAll();
    console.log(users);
    users.forEach(async user => {
      let requestBody = {
        recipient: {
          id: user.psid
        },
        message: message
      };
      try {
        GraphAPi.callSendAPI(requestBody);
      } catch (e) {
        console.log(e);
      }
    });
  }
};
