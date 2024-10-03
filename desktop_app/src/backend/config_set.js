const fs = require("fs");
const crypto = require("hypercore-crypto");
const DHT = require("hyperdht");
const b4a = require("b4a");

// Read config from the provided path or default path
function readConfig(path = "config/keypair.json") {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path));
  } else {
    console.log(`Config file not found at ${path}.`);
    return {};
  }
}

// Write config to the specified path (default is hyperswarm.json)
function writeConfig(config, path = "config/keypair.json") {
  const configDir = "config";
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);
  fs.writeFileSync(path, JSON.stringify(config, null, 2));
}

function generateKeyPair() {
  const privateKey = process.argv[2]
    ? b4a.from(process.argv[2], "hex")
    : crypto.randomBytes(32);
  const keyPair = DHT.keyPair(privateKey);

  return {
    publicKey: b4a.toString(keyPair.publicKey, "hex"),
    secretKey: b4a.toString(keyPair.secretKey, "hex"),
    seed: b4a.toString(privateKey, "hex"),
  };
}

function setOrgTopicConfig(topic, path = "config/org_topic_key.json") {
  const configDir = "config";
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);
  fs.writeFileSync(path, JSON.stringify(topic, null, 2));
}

function getOrgTopicConfig(path = "config/org_topic_key.json") {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path));
  } else {
    console.log(`Config file not found at ${path}.`);
    return {};
  }
}

function verifyTopic(topic) {
  const isValidHex = /^[0-9a-fA-F]+$/.test(topic);
  const isValidLength = topic.length === 64;

  if (isValidHex && isValidLength) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  generateKeyPair,
  readConfig,
  writeConfig,
  setOrgTopicConfig,
  getOrgTopicConfig,
  verifyTopic,
};
