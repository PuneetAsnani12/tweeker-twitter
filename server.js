const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const compression = require("compression");
const session = require("express-session");
const LoginWithTwitter = require("login-with-twitter");
const Twit = require("twit");
const cookieParser = require("cookie-parser"); // parse cookie header

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

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
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let redirect_URL;
let tw;
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  tw = new LoginWithTwitter({
    consumerKey: process.env.API_KEY,
    consumerSecret: process.env.API_SECRET_KEY,
    callbackUrl: "https://tweeker-twitter.herokuapp.com/api/sign",
  });
  redirect_URL = "https://tweeker-twitter.herokuapp.com/";
  // app.get("*", function (req, res) {
  //   res.sendFile(path.join(__dirname, "client/build", "index.html"));
  // });
  // if (process.env.NODE_ENV === 'production') {
  //   app.use(express.static('client/build'));
  // }
} else {
  tw = new LoginWithTwitter({
    consumerKey: process.env.API_KEY,
    consumerSecret: process.env.API_SECRET_KEY,
    callbackUrl: "http://localhost:5000/api/sign",
  });

  redirect_URL = "http://localhost:3000/";
}

// app.use(
//   cors({
//     origin: redirect_URL, // allow to server to accept request from different origin
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true, // allow session cookie from browser to pass through
//   })
// );
app.use(cors());

app.get("/service-worker.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "service-worker.js"));
});

// let User = null;

app.get("/api/auth", (req, res) => {
  if (req.session.user) {
    res.send({ User: req.session.user, auth: true });
  } else {
    res.send({ auth: false });
  }
});

app.get("/api/login", (req, res) => {
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

app.get("/api/sign", (req, res) => {
  let params = {
    oauth_token: req.query.oauth_token,
    oauth_verifier: req.query.oauth_verifier,
  };
  tw.callback(params, req.session.tokenSecret, (err, user) => {
    if (err) {
      console.log(err);
    }

    // user.T = T;
    req.session.user = user;
    // User = user;
    // console.log(req.session);
    // res.send({user});
    res.redirect(redirect_URL);
  });
});

const authCheck = (req, res, next) => {
  if (!req.session.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated",
    });
  } else {
    next();
  }
};

app.get("/api/home_timeline", authCheck, (req, res) => {
  let T = new Twit({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
    access_token: req.session.user.userToken,
    access_token_secret: req.session.user.userTokenSecret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    // strictSSL:            true,     // optional - requires SSL certificates to be valid.
  });

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
            if (domain !== "twitter") {
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
            }
          });
        }
      }
    });

    res.send({ data: Tweets, topDomains, mostShares });
  });
});

app.get("/api/logout", authCheck, (req, res) => {
  req.session.user = null;
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
