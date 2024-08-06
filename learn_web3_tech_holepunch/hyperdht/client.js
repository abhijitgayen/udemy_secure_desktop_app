// need to install `hyperdht` and `b4a`

const DHT = require("hyperdht");
const b4a = require("b4a");

console.log("Connecting to:", process.argv[2]);
const publicKey = b4a.from(process.argv[2], "hex");

const dht = new DHT();
// This public key helps to find the server corresponding to this public key.
const conn = dht.connect(publicKey);
conn.once("open", () => console.log("got connection!"));

process.stdin.pipe(conn).pipe(process.stdout);
