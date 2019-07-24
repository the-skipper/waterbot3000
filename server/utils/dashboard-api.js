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
      console.log(requestBody)
      try {
        let p = new Promise(resolve=>{GraphAPi.callSendAPI(requestBody); resolve();});
        return p
      } catch (e) {
        console.log(e);
      }
    });
  }
};
