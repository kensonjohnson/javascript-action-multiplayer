import { Map_Indoor } from "@/maps/Map_Indoor";
import { SCALE } from "@/constants";
import { Actor, Vector } from "excalibur";

export class Player_CameraStrategy {
  target: Actor;
  map: Map_Indoor;
  position: Vector;

  constructor(target: Actor, map: Map_Indoor) {
    this.target = target;
    this.map = map;

    this.position = new Vector(this.target.pos.x, this.target.pos.y);
  }

  action() {
    const SPEED = 0.08;

    const distance = this.position.distance(this.target.pos);
    if (distance > 2) {
      this.position.x = lerp(this.position.x, this.target.pos.x, SPEED);
      this.position.y = lerp(this.position.y, this.target.pos.y, SPEED);
    }

    // Clamp the camera to the map
    const R_LIMIT = this.map.tileWidth * SCALE * 16 - 7 * SCALE * 16;
    this.position.x = this.position.x > R_LIMIT ? R_LIMIT : this.position.x;

    const L_LIMIT = 8 * SCALE * 16;
    this.position.x = this.position.x < L_LIMIT ? L_LIMIT : this.position.x;

    const D_LIMIT = this.map.tileHeight * SCALE * 16 - 5 * SCALE * 16;
    this.position.y = this.position.y > D_LIMIT ? D_LIMIT : this.position.y;

    const U_LIMIT = 7 * SCALE * 16;
    this.position.y = this.position.y < U_LIMIT ? U_LIMIT : this.position.y;

    return this.position;
  }
}

function lerp(currentValue: number, destinationValue: number, time: number) {
  return currentValue * (1 - time) + destinationValue * time;
}
