import { NetworkPlayer } from "@/actors/Players/NetworkPlayer";
import {
  Direction,
  EVENT_NETWORK_PLAYER_LEAVE,
  EVENT_NETWORK_PLAYER_UPDATE,
} from "@/constants";
import { Engine } from "excalibur";

export type StateUpdate = {
  actionType: string;
  x: number;
  y: number;
  velX?: number;
  velY?: number;
  skinId: "RED" | "BLUE" | "GRAY" | "YELLOW";
  facing: Direction;
  isInPain: boolean;
  isPainFlashing: boolean;
};

type DecodedNetworkString = [
  actionType: string,
  x: string,
  y: string,
  velX: string,
  velY: string,
  skinId: "RED" | "BLUE" | "GRAY" | "YELLOW",
  facing: Direction,
  isInPain: string,
  isPainFlashing: string
];

export class NetworkActorsMap {
  engine: Engine;
  playerMap: Map<string, NetworkPlayer>;

  constructor(engine: Engine) {
    this.engine = engine;
    this.playerMap = new Map();

    // type otherPlayer = { id: string; data: string };
    this.engine.on(EVENT_NETWORK_PLAYER_UPDATE, (otherPlayer: any) => {
      this.onUpdatedPlayer(otherPlayer.id, otherPlayer.data);
    });

    this.engine.on(EVENT_NETWORK_PLAYER_LEAVE, (otherPlayer: any) => {
      this.removePlayer(otherPlayer.id);
    });
  }

  onUpdatedPlayer(id: string, data: string) {
    // Decode network string
    const [
      actionType,
      x,
      y,
      velX,
      velY,
      skinId,
      facing,
      isInPain,
      isPainFlashing,
    ] = data.split("|") as DecodedNetworkString;

    const stateUpdate: StateUpdate = {
      actionType,
      x: Number(x),
      y: Number(y),
      skinId,
      facing,
      isInPain: isInPain === "true",
      isPainFlashing: isPainFlashing === "true",
    };

    if (stateUpdate.isInPain) {
      stateUpdate.velX = Number(velX);
      stateUpdate.velY = Number(velY);
    }

    let otherPlayerActor = this.playerMap.get(id);
    if (!otherPlayerActor) {
      otherPlayerActor = new NetworkPlayer(stateUpdate.x, stateUpdate.y);
      this.playerMap.set(id, otherPlayerActor);
      this.engine.add(otherPlayerActor);
    }

    otherPlayerActor.onStateUpdate(stateUpdate);
  }

  removePlayer(id: string) {
    const actorToRemove = this.playerMap.get(id);
    if (actorToRemove) {
      actorToRemove.kill();
    }
    this.playerMap.delete(id);
  }
}
