const { app, protocol, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile("index.html");

  // // uncomment to show devtools
  // if (process.env.DEV) {
  // mainWindow.webContents.openDevTools(); // Open the DevTools.
  // }

  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  if (mainWindow === null) createWindow();
});
