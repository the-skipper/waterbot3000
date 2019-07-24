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
    response = Response.genText(message);
    users.forEach(async user => {
      let requestBody = {
        recipient: {
          id: user.psid
        },
        message: response
      };
      console.log(requestBody);
      // Send the HTTP request to the Messenger Platform
     return request(
        {
          uri: `${config.graphApiURL}/me/messages`,
          qs: {
            access_token: config.pageAccesToken
          },
          method: "POST",
          json: requestBody
        },
        error => {
          if (error) {
            console.error("Unable to send message:", error);
          }
        }
      );
    });
  }
};
