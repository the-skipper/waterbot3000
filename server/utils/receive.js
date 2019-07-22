/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use strict";

const Response = require("./response"),
  GraphAPi = require("./graph-api");

var defaultPayloads = [];

module.exports = class Receive {
  constructor(user, webhookEvent, availablePayloads) {
    this.user = user;
    this.webhookEvent = webhookEvent;
    this.mPayloads = availablePayloads || defaultPayloads;
  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  handleMessage() {
    let event = this.webhookEvent;

    let responses;

    try {
      if (event.message) {
        let message = event.message;

        if (message.quick_reply) {
          responses = this.handleQuickReply();
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage();
        } else if (message.text) {
          responses = this.handleTextMessage();
        }
      } else if (event.postback) {
        responses = this.handlePostback();
      } else if (event.referral) {
        responses = this.handleReferral();
      }
    } catch (error) {
      console.error(error);
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`
      };
    }

    // send in batches
    if (Array.isArray(responses)) {
      let delay = 0;
      for (let response of responses) {
        this.sendMessage(response, delay * 2000);
        delay++;
      }
    } else {
      this.sendMessage(responses);
    }
  }

  // Handles messages events with text
  handleTextMessage() {
    console.log(
      "Received text:",
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    );

    // check greeting is here and is confident
    // https://developers.facebook.com/docs/messenger-platform/built-in-nlp/

    let greeting = this.firstEntity(this.webhookEvent.message.nlp, "greetings");

    // let thanks = this.firstEntity(this.webhookEvent.message.nlp, "thanks");

    // let byes = this.firstEntity(this.webhookEvent.message.nlp, "bye");

    // Add custom Wit.Ai for weight .. or use facebook quantity ??

    let message = this.webhookEvent.message.text.trim().toLowerCase();

    let response;

    if (
      (greeting && greeting.confidence > 0.8) ||
      message.includes("start over")
    ) {
      response = Response.genStartMessage(this.user);
    } else if (message.includes("kg")) {
      // Weight hack implement correct with Wit.AI
      response = Response.genStartMessage(this.user);
    } else {
      response = [
        Response.genText({
          message: this.webhookEvent.message
        })
      ];
    }

    return response;
  }

  // Handles mesage events with attachments
  handleAttachmentMessage() {
    let response;

    // Get the attachment
    let attachment = this.webhookEvent.message.attachments[0];
    console.log("Received attachment:", `${attachment} for ${this.user.psid}`);

    response = Response.genStartMessage(this.user, { text: "Thanks!" });

    return response;
  }

  // Handles mesage events with quick replies
  handleQuickReply() {
    // Get the payload of the quick reply
    let payload = this.webhookEvent.message.quick_reply.payload;

    return this.handlePayload(payload);
  }

  // Handles postbacks events
  handlePostback() {
    let postback = this.webhookEvent.postback;
    // Check for the special Get Starded with referral
    let payload;
    if (postback.referral && postback.referral.type == "OPEN_THREAD") {
      payload = postback.referral.ref;
    } else {
      // Get the payload of the postback
      payload = postback.payload;
    }
    return this.handlePayload(payload.toUpperCase());
  }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    let payload = this.webhookEvent.referral.ref.toUpperCase();

    return this.handlePayload(payload);
  }

  handlePayload(payload) {
    console.log("Received Payload:", `${payload} for ${this.user.psid}`);

    // Log CTA event in FBA
    GraphAPi.callFBAEventsAPI(this.user.psid, payload);

    let response;

    if (typeof this.mPayloads[0] === "string") {
      switch (payload) {
        case "GET_STARTED_GREET":
          response = Response.genStartMessage(this.user);
          break;
        case "REMIND_YES":
          response = Response.genQuickReply(
            "Got it!, would you like to be reminded every day?",
            [
              {
                title: "Sure!",
                payload: "EVERY_DAY_YES"
              },
              {
                title: "No, thanks",
                payload: "EVERY_DAY_NO"
              }
            ]
          );
          break;
        case "REMIND_NO":
          response = Response.genText(
            "Ok, but this happens if you don't drink enough, https://www.youtube.com/watch?v=8gqM4qtzEMI"
          );
          break;
        case "EVERY_DAY_YES":
          // TODO SET REMINDERS
          break;
        case "EVERY_DAY_NO":
          break;
        default:
          response = {
            text: `This is a default postback message for payload: ${payload}!`
          };
      }
    } else {
      console.log(this.mPayloads[0]);
      this.mPayloads.forEach(pl => {
        if (pl.payload === payload) {
          pl.text.replace(/\{firstName\}/g, this.user);
          pl.text.replace(/\{lastName\}/g, this.user);
          pl.text.replace(/\{username\}/g, this.user);
          if (pl.quick_replies.length > 0) {
            response = Response.genQuickReply(pl.text, pl.quick_replies);
          } else {
            response = Response.genText(pl.text);
          }
        }
      });
      if (!response) {
        if (payload === "GET_STARTED_GREET") {
          response = Response.genStartMessage(this.user);
        } else {
          response = {
            text: `This is a default dynamic postback message for payload: ${payload}!`
          };
        }
      }
    }

    console.log(payload);
    return response;
  }

  sendMessage(response, delay = 0) {
    // Check if there is delay in the response
    if ("delay" in response) {
      delay = response["delay"];
      delete response["delay"];
    }

    // Construct the message body
    let requestBody = {
      recipient: {
        id: this.user.psid
      },
      message: response
    };

    setTimeout(() => GraphAPi.callSendAPI(requestBody), delay);
  }

  // Facebook Messenger NLP
  firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
  }
};
