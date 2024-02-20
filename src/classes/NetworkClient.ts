import {
  EVENT_NETWORK_PLAYER_LEAVE,
  EVENT_NETWORK_PLAYER_UPDATE,
} from "@/constants";
import { guidGenerator } from "@/helpers";
import { Engine } from "excalibur";
import Peer, { DataConnection } from "peerjs";

const PORT = 9002;

const LOCALHOST_CONFIG = {
  host: "localhost",
  key: "demodemo",
  port: PORT,
  path: "/myapp",
};

const LOCALHOST_URL = `http://localhost:${PORT}`;

export class NetworkClient {
  engine: Engine;
  peerId: string;
  connectionMap: Map<string, DataConnection>;
  peer?: Peer;

  constructor(engine: Engine) {
    this.engine = engine;
    this.peerId = "Player_" + guidGenerator();
    this.connectionMap = new Map();
    void this.init();
  }

  async init() {
    this.peer = new Peer(this.peerId, LOCALHOST_CONFIG);

    this.peer.on("error", (err) => {
      console.error(err);
    });

    // Be ready to hear from incoming connections
    this.peer.on("connection", async (connection) => {
      // A new player has connected
      connection.on("open", () => {
        this.connectionMap.set(connection.peer, connection);
      });

      // A player has disconnected
      connection.on("close", () => {
        this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, connection.peer);
      });

      // Receive data from other players
      connection.on("data", (data) => {
        this.handleIncomingData(connection, data);
      });

      // Close connection if I leave
      window.addEventListener("unload", () => {
        connection.close();
      });
    });

    // Make all outgoing connections
    const otherPeerIds = await this.getAllPeerIds();

    await timeout(1000);

    for (const id of otherPeerIds) {
      // I joined and reached out to all the other players.
      const conn = this.peer.connect(id);

      // Register to each player I know about
      conn.on("open", () => {
        this.connectionMap.set(id, conn);
      });

      // Know when it's closed
      conn.on("close", () => {
        this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
      });

      // Subscribe to their updates
      conn.on("data", (data) => {
        this.handleIncomingData(conn, data);
      });

      // Close the connection if I leave
      window.addEventListener("unload", () => {
        conn.close();
      });

      await timeout(200);
    }
  }

  handleIncomingData(connection: DataConnection, data: any) {
    console.log("Got data from", connection.peer, data);

    // Handle PLAYER prefix
    this.engine.emit(EVENT_NETWORK_PLAYER_UPDATE, {
      id: connection.peer,
      data,
    });
  }

  async getAllPeerIds() {
    const response = await fetch(`${LOCALHOST_URL}/myapp/demodemo/peers`);
    const peersArray = await response.json();
    const list = peersArray ?? [];
    return list.filter((id: string) => id !== this.peerId);
  }

  sendUpdate(update: string) {
    this.connectionMap.forEach((connection) => {
      connection.send(update);
    });
  }
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
