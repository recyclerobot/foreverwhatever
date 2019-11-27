var Datastore = require("nedb");
var { google } = require("googleapis");

const { log } = require("./utils/log");
var connectToYoutube = require("./utils/youtube");

const minutes = 60 * 1000;
const interval = 15 * minutes;

// Construct store
var db = new Datastore({ filename: "./db/videos.db", autoload: true });

const crunchResponse = response => {
  console.log("💪 crunchResponse!");
  // Handle the results here (response.result has the parsed body).
  // log(response);
  if (response.data.items.length > 0) {
    response.data.items.map(item => {
      // check if already in db
      db.find({ "id.videoId": item.id.videoId }, function(err, docs) {
        if (err) console.error("🚨", err);
        // docs is an array containing documents
        // If no document is found, docs is equal to []
        if (docs.length === 0) {
          db.insert(item);
          console.log("🍌 doc inserted with id", item.id.videoId);
        } else {
          console.log("🍎 doc with id already exists", item.id.videoId);
        }
      });
    });
  }
};

const searchAndSave = q => {
  connectToYoutube(function(auth) {
    console.log("✨ connectToYoutube with q=", q);

    const dateMinusXHour = new Date();
    dateMinusXHour.setHours(dateMinusXHour.getHours() - 3);

    var service = google.youtube("v3");
    service.search
      .list({
        auth: auth,
        part: "snippet",
        order: "date",
        maxResults: 50,
        publishedAfter: dateMinusXHour.toISOString(),
        q,
        type: "video",
        videoDuration: "short",
        videoType: "any"
      })
      .then(
        function(response) {
          crunchResponse(response);
        },
        function(err) {
          console.error("🚨", err);
        }
      );
  });
};

// Define common used file formats
const searchAllFileFormats = () => {
  searchAndSave("IMG*");
  searchAndSave("DSC*");
};

// Do search
searchAllFileFormats();

// Run every x minutes ♾
setInterval(function() {
  console.log("===============================");
  console.log("⏰ ", new Date().toISOString());
  searchAllFileFormats();
}, interval);
