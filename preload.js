const fs = require("fs");
const path = require("path");
var Datastore = require("nedb");
const shuffle = require("./shuffle");

// Construct store
var db = new Datastore({
  filename: path.resolve(__dirname, "db/videos.db"),
  autoload: true
});

// Vars
let fileList = fs.readdirSync(path.resolve(__dirname, "./downloads"));
let index = 0; // last checked index: 124
let currentFile;
let currentVideoId;
let modus = 1;

// Helper
const removeFromFs = videoId => {
  // something went wrong, lets remove from db
  console.log("☠️", videoId, "removing from file system...");
  fs.unlinkSync(path.resolve(__dirname, `./downloads/${currentFile}`));
};

const favoriteVideo = videoId => {
  db.update(
    { "id.videoId": videoId },
    { $set: { favorite: true } },
    {},
    (err, doc) => {
      if (err) console.error("🚨", err);
      console.log("✨ favorite", doc);
    }
  );
};

const dontShowAgainVideo = videoId => {
  db.update(
    { "id.videoId": videoId },
    { $set: { hidden: true } },
    {},
    (err, doc) => {
      if (err) console.error("🚨", err);
      console.log("⛱ hide", doc);
    }
  );
};

const reset = () => {
  // reset index
  index = 0;

  // reset all hidden and favorites
  db.update(
    {},
    { $set: { hidden: false, favorite: false } },
    { multi: true },
    (err, doc) => {
      if (err) console.error("🚨", err);
      console.log("⛱ hide", doc);
    }
  );
};

function playNextVideo() {
  // 1. get file
  currentFile = fileList[index];
  currentVideoId = currentFile.split(".")[0];

  // 2. increase index, in case anything goes wrong, we're already on the next video
  index += 1;
  if (index >= fileList.length) index = 0;
  console.log("🦞 index: ", index);

  // 3. search in db
  db.findOne({ "id.videoId": currentVideoId }, function(err, doc) {
    if (err || !doc) {
      console.error("🚨 err or no doc", err);
      removeFromFs(currentVideoId); // no db entry? lets remove it
      playNextVideo();
      return;
    }

    // 3. Check conditions
    const cond = modus === 2 ? doc.favorite : !doc.hidden && !doc.favorite;
    if (doc && cond) {
      console.log("doc", doc);

      // 4. replace video
      document
        .getElementsByTagName("video")[0]
        .setAttribute("src", "./downloads/" + currentFile);

      // 4. add to overflow
      const element = document.getElementById("overlay");
      const date = new Date(doc.snippet.publishedAt);
      const month = date.toLocaleString("default", { month: "short" });
      const dateStr = `${month} ${date.getDay()}, ${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
      element.innerText = `${doc.snippet.title}
${dateStr}
${Math.floor(Math.random() * 5, 10)} views`;
    } else {
      // doesnt meet conditions to be shown, try again!
      console.log(
        "🦀 doesnt meet conditions to be shown, hidden: ",
        doc.hidden,
        "favorite",
        doc.favorite
      );

      // try next video (with delay, if there are no more videos available > dont flood)
      setTimeout(playNextVideo, 1000);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("fileList", fileList);
});

document.addEventListener(
  "keydown",
  event => {
    const keyName = event.key;

    // 1 = Start in "forever or whatever mode"
    if (keyName === "1") {
      modus = 1;
      fileList = shuffle(fileList);
      playNextVideo();
      return;
    }

    // 2 = Start in "only forever"
    if (keyName === "2") {
      modus = 2;
      playNextVideo();
      return;
    }

    // N = next video
    if (keyName === "n") {
      playNextVideo();
      return;
    }

    // S = shuffle video
    if (keyName === "s") {
      fileList = shuffle(fileList);
      console.log("shuffled fileList", fileList);
      return;
    }

    // R = reset
    if (keyName === "r") {
      reset();
      return;
    }

    // D = delete
    if (keyName === "d") {
      removeFromFs(currentVideoId);
      return;
    }

    // f = Forever aka safe to favorites
    if (keyName === "f") {
      favoriteVideo(currentVideoId);
      playNextVideo();
      return;
    }

    // W = Whatever aka dont show again
    if (keyName === "w") {
      dontShowAgainVideo(currentVideoId);
      playNextVideo();
      return;
    }
  },
  false
);
