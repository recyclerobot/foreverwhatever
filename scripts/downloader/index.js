var Datastore = require("nedb");
const fs = require("fs");
const ytdl = require("ytdl-core");

const minutes = 60 * 1000;
const interval = 5 * minutes;

// Construct store
var db = new Datastore({ filename: "db/videos.db", autoload: true });

const removeFromDb = (e, videoId) => {
  // something went wrong, lets remove from db
  console.log("🚨", e, "something went wrong, removing from db");
  db.remove({ "id.videoId": videoId }, {}, function(err, numRemoved) {
    if (err) console.error("🚨", err);
    console.log("🗑 Removed", numRemoved, " x ", videoId);
  });
  downloadAllInDb();
};

const updateDbAndContinue = videoId => {
  db.update(
    { "id.videoId": videoId },
    { $set: { downloaded: true } },
    {},
    (err, doc) => {
      if (err) console.error("🚨", err);
      console.log("🎢", doc);
    }
  );
  setTimeout(downloadAllInDb, 1000); // check after 10 sec
};

const downloadAllInDb = () => {
  // Find all documents in the collection
  db.findOne({ downloaded: { $exists: false } }, function(err, doc) {
    if (err) console.error("🚨", err);
    if (doc) {
      const videoId = doc.id.videoId;
      const path = `downloads/${videoId}.mp4`;

      if (fs.existsSync(path)) {
        console.log(
          "🍎 file with id already exists, deleting and retrying",
          path
        );
        fs.unlinkSync(path); // remove any old attempt of downloading
      }
      console.log("🍌 downloading with id", videoId);
      try {
        const video = ytdl(`http://www.youtube.com/watch?v=${videoId}`);
        video.on("error", err => removeFromDb(err, videoId));
        video.pipe(fs.createWriteStream(path));
        video.on("end", () => {
          console.log("✨ Downloaded!", videoId);
          updateDbAndContinue(videoId);
        });
      } catch (e) {
        removeFromDb(e, videoId);
      }
    }
  });
};

// Download all
downloadAllInDb();

// Run every x minutes ♾
setInterval(function() {
  console.log("===============================");
  console.log("⏰ ", new Date().toISOString());
  downloadAllInDb();
}, interval);
