/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use strict";

module.exports = class Response {
  static genQuickReply(text, quickReplies) {
    let response = {
      text: text,
      quick_replies: []
    };

    for (let quickReply of quickReplies) {
      response["quick_replies"].push({
        content_type: "text",
        title: quickReply["title"],
        payload: quickReply["payload"]
      });
    }

    return response;
  }

  static genImageTemplate(image_url, title, subtitle = "") {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: title,
              subtitle: subtitle,
              image_url: image_url
            }
          ]
        }
      }
    };

    return response;
  }

  static genText(text) {
    let response = {
      text: text
    };

    return response;
  }

  static genPostbackButton(title, payload) {
    let response = {
      type: "postback",
      title: title,
      payload: payload
    };

    return response;
  }

  static genStartMessage(user) {
    let welcome = this.genText(
      `Hi ${user.firstName}, I'm Bot, WaterBot 3000, Something terrible happend in the future, you didn't drink enough water, would you like me to remind you so we can change the outcome`
    );

    let quickReplies = [
      {
        title: "Yes!",
        payload: "REMIND_YES"
      },
      {
        title: "No",
        payload: "REMIND_NO"
      }
    ];
    let reminder = this.genQuickReply(welcome, quickReplies);

    return [welcome, reminder];
  }
};
