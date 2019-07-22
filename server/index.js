const express = require("express"),
  { urlencoded, json } = require("body-parser"),
  path = require("path"),
  config = require("./utils/config"),
  Receive = require("./utils/receive"),
  GraphAPi = require("./utils/graph-api"),
  User = require("./utils/user"),
  crypto = require("crypto"),
  // PayloadsHelper = require("./utils/payloads"),
  Payloads = require("./models/payloads"),
  mongoose = require("mongoose"),
  app = express();

// for fast check.
var users = [];
var payloads = [];
// connect to database
mongoose.connect(config.databaseUri);

// populate available payloads

app.use(urlencoded({ extended: true }));

app.use(json({ verify: verifyRequestSignature }));

app.use(express.static(path.join(__dirname, "/../client/build")));

app.get("/webhook", (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === config.verifyToken) {
      // Responds with the challenge token from the request
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    // return 200 to fb so it stays calm
    res.status(200).send("EVENT_RECEIVED");

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(entry => {
      // Gets the body of the webhook event, array but allways resolves to single event
      let webhookEvent = entry.messaging[0];
      let senderPsid = webhookEvent.sender.id;

      if (!(senderPsid in users)) {
        let user = new User(senderPsid);

        GraphAPi.getUserProfile(senderPsid)
          .then(userProfile => {
            user.setProfile(userProfile);
            user.syncProfile(userProfile);
            Payloads.find({})
              .exec()
              .then(ploads => {
                payloads = [...ploads];
              })
              .catch(error => {
                console.log(error);
              });
          })
          .catch(error => {
            // The profile is unavailable
            console.log("Profile is unavailable:", error);
          })
          .finally(() => {
            users[senderPsid] = user;
            let receiveMessage = new Receive(
              users[senderPsid],
              webhookEvent,
              payloads
            );
            return receiveMessage.handleMessage();
          });
      } else {
        // User already exists
        Payloads.find({})
          .exec()
          .then(ploads => {
            payloads = [...ploads];
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
            let receiveMessage = new Receive(
              users[senderPsid],
              webhookEvent,
              payloads
            );
            return receiveMessage.handleMessage();
          });
      }
    });
  } else {
    // Returns a '404 Not Found'
    res.sendStatus(404);
  }
});

//
app.get("/payloads", async (req, res) => {
  res.send(await Payloads.find({}).exec());
});

app.post("/payloads", async (req, res) => {
  let payload = new Payloads(req.body);
  payload.save();
  res.status(201).send(payload);
});
// Handle all non API requests and delegate to React Frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/../client/build/index.html"));
});

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    console.log("Couldn't validate the signature.");
  } else {
    var elements = signature.split("=");
    var signatureHash = elements[1];
    var expectedHash = crypto
      .createHmac("sha1", config.appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash !== expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

var listener = app.listen(config.port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
