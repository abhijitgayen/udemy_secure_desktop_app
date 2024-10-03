const Hyperswarm = require("hyperswarm");
const goodbye = require("graceful-goodbye");
const crypto = require("hypercore-crypto");
const b4a = require("b4a");
const {
  getOrgTopicConfig,
  setOrgTopicConfig,
  verifyTopic,
} = require("./config_set");

class HyperswarmClient {
  constructor(keypair) {
    this.conns = [];
    this.keypair = {
      publicKey: b4a.from(keypair.publicKey, "hex"),
      secretKey: b4a.from(keypair.secretKey, "hex"),
    };
    this.seed = b4a.from(keypair.seed, "hex");
    this.swarm = new Hyperswarm(this.seed);
    goodbye(() => this.swarm.destroy());
  }

  getOrgTopic() {
    return getOrgTopicConfig();
  }

  setOrgTopic(topic) {
    try {
      if (verifyTopic(topic)) {
        setOrgTopicConfig(topic);
        return true;
      }
      return false;
    } catch (e) {
      console.error("setOrgTopic Error:", str(e));
      return false;
    }
  }

  generateOrgTopic() {
    const topic = b4a.toString(crypto.randomBytes(32), "hex");
    return topic;
  }

  async connect({ cb_fn, org_topic }) {
    if (!org_topic) {
      console.error("org_topic is required for connection.");
      return false;
    }

    this.swarm.on("connection", (conn) => {
      const name = b4a.toString(conn.remotePublicKey, "hex");
      console.log("* got a connection from:", name, "*");
      this.conns.push(conn);
      conn.once("close", () => this.conns.splice(this.conns.indexOf(conn), 1));
      conn.on("data", (data) => {
        console.log(`${name}: ${data}`);
        const message_data = JSON.parse(data);
        cb_fn(message_data);
      });
    });

    const topic = b4a.from(org_topic, "hex");
    const discovery = this.swarm.join(topic, { client: true, server: true });
    await discovery.flushed();
    return true;
  }

  boardCastMessage({ data }) {
    if (!data) {
      console.error("Data is missing.");
      return false;
    }

    try {
      for (const conn of this.conns) {
        conn.write(Buffer.from(JSON.stringify(data)));
      }

      return true;
    } catch (e) {
      console.error("Message send error", str(e));
      return false;
    }
  }

  sendMessageToPeer({ data, peer_public_key }) {
    if (!data || !peer_public_key) {
      console.error("Data or peer public key is missing.");
      return false;
    }

    try {
      const peer_socket = this.conns.find(
        (obj) => b4a.toString(obj.remotePublicKey, "hex") === peer_public_key,
      );

      if (!peer_socket) {
        return false;
      }

      peer_socket.write(Buffer.from(JSON.stringify(data)));
      return true;
    } catch (e) {
      console.error("not able to send message ->", e);
      return false;
    }
  }
}

module.exports = HyperswarmClient;
