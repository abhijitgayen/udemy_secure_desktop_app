// need to install `hyperswarm`, `graceful-goodbye`, `hypercore-crypto` and `b4a`

const Hyperswarm = require("hyperswarm");
const goodbye = require("graceful-goodbye");
const crypto = require("hypercore-crypto");
const b4a = require("b4a");

const swarm = new Hyperswarm();
// it helps avoid DHT pollution
goodbye(() => swarm.destroy());

const network = [];

swarm.on("connection", (conn) => {
  const name = b4a.toString(conn.remotePublicKey, "hex");
  console.log("* got a connection from:", name, "*");
  network.push(conn);
  conn.once("close", () => network.splice(network.indexOf(conn), 1));
  conn.on("data", (data) => console.log(`${name}: ${data}`));
  conn.on("error", (err) => console.log(`${name}: ${err}`));
});

// If you write any message it will send this message to all people in the same network
process.stdin.on("data", (d) => {
  for (const conn of network) {
    conn.write(d);
  }
});

// if you have topic you can connect with this topic
const topic = process.argv[2]
  ? b4a.from(process.argv[2], "hex")
  : crypto.randomBytes(32);
const discovery = swarm.join(topic, { client: true, server: true });

// The flushed promise will resolve when the topic has been fully announced to the DHT
discovery.flushed().then(() => {
  console.log("joined topic:", b4a.toString(topic, "hex"));
});
