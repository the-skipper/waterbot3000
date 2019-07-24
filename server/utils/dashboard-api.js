request = require("request"),
config = require("./config");
const GraphAPi = require("./graph-api");
const Response = require("./response");
const User = require("./user");


module.exports = class DashboardApi {
  //Message all users from database
  static async messageAllUsers(message) {
    let users = await User.findAll();
    console.log(users);
    console.log(message)
    var response = Response.genText(message)
    console.log(response)
    users.forEach(async user => {
      let requestBody = {
        recipient: {
          id: user.psid
        },
        message: response
      };
      console.log(requestBody);
      GraphAPi.callSendAPI(requestBody);
    });
  }

  
};
