/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use strict";

// Imports dependencies
const request = require("request"),
  camelCase = require("camelcase"),
  config = require("./config");

module.exports = class GraphAPi {
  static callSendAPI(requestBody) {
    // Send the HTTP request to the Messenger Platform
    request(
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
  }

  static callMessengerProfileAPI(requestBody) {
    // Send the HTTP request to the Messenger Profile API

    console.log(`Setting Messenger Profile for app ${config.appId}`);
    request(
      {
        uri: `${config.graphApiURL}/me/messenger_profile`,
        qs: {
          access_token: config.pageAccesToken
        },
        method: "POST",
        json: requestBody
      },
      (error, _res, body) => {
        if (!error) {
          console.log("Request sent:", body);
        } else {
          console.error("Unable to send message:", error);
        }
      }
    );
  }
  // Get the user and transform returned keys
  static async getUserProfile(senderPsid) {
    try {
      const userProfile = await this.callUserProfileAPI(senderPsid);

      for (const key in userProfile) {
        const camelizedKey = camelCase(key);
        const value = userProfile[key];
        delete userProfile[key];
        userProfile[camelizedKey] = value;
      }

      return userProfile;
    } catch (err) {
      console.log("Fetch failed:", err);
    }
  }

  static callUserProfileAPI(senderPsid) {
    return new Promise(function(resolve, reject) {
      let body = [];

      // Send the HTTP request to the Graph API
      request({
        uri: `${config.graphApiURL}/${senderPsid}`,
        qs: {
          access_token: config.pageAccesToken,
          fields: "first_name, last_name"
        },
        method: "GET"
      })
        .on("response", function(response) {
          // console.log(response.statusCode);

          if (response.statusCode !== 200) {
            reject(Error(response.statusCode));
          }
        })
        .on("data", function(chunk) {
          body.push(chunk);
        })
        .on("error", function(error) {
          console.error("Unable to fetch profile:" + error);
          reject(Error("Network Error"));
        })
        .on("end", () => {
          body = Buffer.concat(body).toString();
          console.log(JSON.parse(body));
          resolve(JSON.parse(body));
        });
    });
  }

  static callNLPConfigsAPI() {
    // Send the HTTP request to the Built-in NLP Configs API
    // https://developers.facebook.com/docs/graph-api/reference/page/nlp_configs/

    console.log(`Enable Built-in NLP for Page ${config.pageId}`);
    request(
      {
        uri: `${config.graphApiURL}/me/nlp_configs`,
        qs: {
          access_token: config.pageAccesToken,
          nlp_enabled: true
        },
        method: "POST"
      },
      (error, _res, body) => {
        if (!error) {
          console.log("Request sent:", body);
        } else {
          console.error("Unable to activate built-in NLP:", error);
        }
      }
    );
  }

  static callFBAEventsAPI(senderPsid, eventName) {
    // Construct the message body
    let requestBody = {
      event: "CUSTOM_APP_EVENTS",
      custom_events: JSON.stringify([
        {
          _eventName: "postback_payload",
          _value: eventName,
          _origin: "waterbot3000"
        }
      ]),
      advertiser_tracking_enabled: 1,
      application_tracking_enabled: 1,
      extinfo: JSON.stringify(["mb1"]),
      page_id: config.pageId,
      page_scoped_user_id: senderPsid
    };

    // Send the HTTP request to the Activities API
    request(
      {
        uri: `${config.graphApiURL}/${config.appId}/activities`,
        method: "POST",
        form: requestBody
      },
      error => {
        if (!error) {
          console.log(`FBA event '${eventName}'`);
        } else {
          console.error(`Unable to send FBA event '${eventName}':` + error);
        }
      }
    );
  }
};
