"use strict";

const {
  generateKeyPair,
  readConfig,
  writeConfig,
} = require("./src/backend/config_set");

// Try to read the status file, generate keypair if not found
let keypair = {};

try {
  keypair = readConfig();
  if (!keypair.privateKey || !keypair.publicKey) {
    keypair = generateKeyPair();
    writeConfig(keypair);
    console.log(
      "Keypair is created and saved successfully in the location config/keypair.json.",
    );
  } else {
    console.log(
      "Keypair is already present in the location config/keypair.json.",
    );
  }
} catch (e) {
  console.error(e.message);
}
