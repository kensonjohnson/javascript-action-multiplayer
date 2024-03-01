import { NetworkMonster } from "@/actors/Monsters/NetworkMonster";
import { NetworkPlayer } from "@/actors/Players/NetworkPlayer";
import {
  Direction,
  EVENT_NETWORK_MONSTER_UPDATE,
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
  playerMap: Map<string, NetworkPlayer | NetworkMonster>;

  constructor(engine: Engine) {
    this.engine = engine;
    this.playerMap = new Map();

    this.engine.on(EVENT_NETWORK_PLAYER_UPDATE, (otherPlayer: any) => {
      this.onUpdatedPlayer(otherPlayer.id, otherPlayer.data);
    });

    this.engine.on(EVENT_NETWORK_MONSTER_UPDATE, (content: any) => {
      this.onUpdatedMonster(content);
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

    let otherPlayerActor = this.playerMap.get(id) as NetworkPlayer | undefined;
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

  onUpdatedMonster(content: any) {
    const [_type, networkId, x, y, _velX, _velY, facing, hasPainState, hp] =
      content.split("|");

    let networkActor = this.playerMap.get(networkId) as
      | NetworkMonster
      | undefined;
    // Add new if it doesn't exist
    if (!networkActor) {
      networkActor = new NetworkMonster(x, y);
      this.playerMap.set(networkId, networkActor);
      this.engine.add(networkActor);
    }

    // Update the node
    networkActor.pos.x = Number(x);
    networkActor.pos.y = Number(y);
    networkActor.facing = facing as Direction;
    networkActor.hasPainState = hasPainState === "true";

    // Destroy if dead
    if (Number(hp) <= 0) {
      networkActor.tookFinalDamage();
      this.playerMap.delete(networkId);
    }
  }
}
