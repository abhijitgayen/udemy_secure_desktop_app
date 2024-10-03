const { app, BrowserWindow } = require("electron/main");
const path = require("node:path");
const { ipcMain } = require("electron");

const {
  readConfig,
  generateKeyPair,
  writeConfig,
  getOrgTopicConfig,
  setOrgTopicConfig,
} = require("./src/backend/config_set");
const HyperswarmClient = require("./src/backend/hyperswarm_client");
const { exit } = require("graceful-goodbye");

// load keypair from config file
let keyPairConfig = {};
try {
  keyPairConfig = readConfig();
  if (!keyPairConfig.privateKey || !keyPairConfig.publicKey) {
    keyPairConfig = generateKeyPair();
    writeConfig(keyPairConfig);
  }
} catch (e) {
  console.error(e.message);
  exit(0);
}

const conClient = new HyperswarmClient(keyPairConfig);
let mainWin;

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const orgTopicKey = conClient.getOrgTopic();

  if (!orgTopicKey?.topic) {
    mainWin.loadFile("src/askTopic.html");
  } else {
    conClient.connect({
      cd_fn: (data) => console.log(data),
      org_topic: orgTopicKey?.topic,
    });
    mainWin.loadFile("src/index.html");
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("submit-topic", (event, topicKey) => {
  console.log("Topic received from Renderer:", topicKey);
  let config = getOrgTopicConfig();

  if (!topicKey) {
    const generatedTopic = conClient.generateOrgTopic();
    config.topic = generatedTopic;
    console.log(`Generated new organization topic: ${generatedTopic}`);
  } else {
    config.topic = topicKey;
    console.log(`Using provided organization topic: ${topicKey}`);
  }

  setOrgTopicConfig(config);

  // Close the existing window before reloading index.html
  if (mainWin) {
    mainWin.close();
  }
  createWindow();

  // Reload the window to render index.html
  // mainWin.loadFile("src/index.html");
});

ipcMain.on("send-data", (event, arg) => {
  console.log(arg); // Prints 'Hello from Renderer'
  // Send a reply back to the renderer process
  event.reply("get-data", "Hello from Main");
});
