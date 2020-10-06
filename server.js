const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const compression = require("compression");
const session = require("express-session");
const LoginWithTwitter = require("login-with-twitter");
const Twit = require("twit");

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const tw = new LoginWithTwitter({
  consumerKey: process.env.API_KEY,
  consumerSecret: process.env.API_SECRET_KEY,
  callbackUrl: "https://tweeker.netlify.app/sign",
});

const app = express();

const port = process.env.PORT || 5000;
app.set("trust proxy", 1); // trust first proxy
// app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(compression());
app.use(
  session({
    secret: "puneetasnani",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.get("/service-worker.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "service-worker.js"));
});

let User = null;

app.get("/auth", (req, res) => {
  // console.log(req.session);
  // res.send({ error: "Not Authenticated" });
  //  console.log(req.session);
  if (req.session.user || User) {
    res.send({ User, auth: true });
  } else {
    res.send({ auth: false });
  }
});

app.get("/login", (req, res) => {
  tw.login((err, tokenSecret, url) => {
    if (err) {
      // Handle the error your way
      console.log(err);
    }

    // Save the OAuth token secret for use in your /twitter/callback route
    req.session.tokenSecret = tokenSecret;
    // console.log(url);
    // Redirect to the /twitter/callback route, with the OAuth responses as query params
    res.redirect(url);
  });
});

app.get("/sign", (req, res) => {
  let params = {
    oauth_token: req.query.oauth_token,
    oauth_verifier: req.query.oauth_verifier,
  };
  tw.callback(params, req.session.tokenSecret, (err, user) => {
    if (err) {
      console.log(err);
    }
    let T = new Twit({
      consumer_key: process.env.API_KEY,
      consumer_secret: process.env.API_SECRET_KEY,
      access_token: user.userToken,
      access_token_secret: user.userTokenSecret,
      timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
      // strictSSL:            true,     // optional - requires SSL certificates to be valid.
    });

    user.T = T;
    req.session.user = user;
    User = user;
    // console.log(req.session);
    // res.send({user});
    res.redirect("https://tweeker.netlify.app/");
  });
});

const authCheck = (req, res, next) => {
  if (!User) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated",
    });
  } else {
    next();
  }
};

app.get("/home_timeline", authCheck, (req, res) => {
  T = User.T;
  let Tweets = [];
  let topDomains = {};
  let mostShares = {};
  // console.log(T);
  T.get("statuses/home_timeline", { count: 200 }, async function (
    err,
    data,
    response
  ) {
    data.forEach((obj) => {
      if (obj.entities["urls"].length > 0) {
        var diff_of_dates = tweeterCreateAtToJSDate(obj.created_at);
        if (diff_of_dates <= 7) {
          Tweets.push(obj);
          if (!mostShares[obj.user.screen_name]) {
            mostShares[obj.user.screen_name] = 1;
          } else {
            mostShares[obj.user.screen_name] += 1;
          }

          obj.entities["urls"].forEach((urlObject) => {
            let domain = urlObject.expanded_url
              .replace("http://", "")
              .replace("https://", "")
              .replace("www.", "")
              .split(/[./?#]/)[0];
            if (!topDomains[domain]) {
              topDomains[domain] = {
                count: 1,
                name: urlObject.expanded_url
                  .replace("http://", "")
                  .replace("https://", "")
                  .split(/[/?#]/)[0],
              };
            } else {
              topDomains[domain].count += 1;
            }
          });
        }
      }
    });

    res.send({ data: Tweets, topDomains, mostShares });
  });
});

app.get("/logout", authCheck, (req, res) => {
  User = null;
  res.send({ auth: false });
});

function tweeterCreateAtToJSDate(stringDate) {
  now = new Date();
  createdAt = new Date(stringDate);
  return Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate()
      )) /
      (1000 * 60 * 60 * 24)
  );
}

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`Server is running on ${port}`);
});
