// need to install `hyperdht`, `b4a` and `graceful-goodbye`

const DHT = require("hyperdht");
const goodbye = require("graceful-goodbye");
const b4a = require("b4a");

const dht = new DHT();

// This keypair is your peer identifier in the DHT
const keyPair = DHT.keyPair();

const server = dht.createServer((conn) => {
  console.log("got connection!");
  process.stdin.pipe(conn).pipe(process.stdout);
});
server.listen(keyPair).then(() => {
  console.log("listening on:", b4a.toString(keyPair.publicKey, "hex"));
});

// it helps avoid DHT pollution
goodbye(() => server.close());
