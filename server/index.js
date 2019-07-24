const express = require("express"),
  { urlencoded, json } = require("body-parser"),
  path = require("path"),
  crypto = require("crypto"),
  mongoose = require("mongoose"),
  jwt = require("express-jwt"),
  jwks = require("jwks-rsa"),
  app = express();

const config = require("./utils/config"),
  Receive = require("./utils/receive"),
  GraphAPi = require("./utils/graph-api"),
  User = require("./utils/user"),
  Payloads = require("./models/payloads"),
  PayloadHelper = require("./utils/payloads");
  DashboardApi = require("./utils/dashboard-api");

// for fast check.
var users = [];
var payloads = [];
// connect to database
mongoose.connect(config.databaseUri);

// add token validating middleware DashboardApi.messageAllUsers(req.body.message)
var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.domain}/.well-known/jwks.json`
  }),
  audience: config.audience,
  issuer: `https://${config.domain}/`,
  algorithms: ["RS256"]
});

// app.use(jwtCheck);

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
app.get("/api/payloads", jwtCheck, async (req, res) => {
  try {
    let payloads = await Payloads.find({}).exec();
    res.json(payloads);
  } catch (err) {
    res.status(500).send(err);
  }
  res.status(500).send("Error");
});

app.post("/api/payloads", jwtCheck, async (req, res) => {
  try {
    let newPayload = await PayloadHelper.createPayload(req.body)
    res.status(201).send({ response: newPayload });
  } catch (err) {
    res.status(500).send(err);
  }
  res.status(500).send("Error");
});

app.post("/api/message", jwtCheck, async (req, res) => {
  try {
    // Validation..
    var m = await DashboardApi.messageAllUsers(req.body.message);
    res.json({ m });
  } catch (err) {
    res.status(500).send(err);
  }
  res.status(500).send("Error");
});

app.get("/api/chatusers", jwtCheck, async (req, res) => {
  try {
    let users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).send(err);
  }
  res.status(500).send("Error");
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
