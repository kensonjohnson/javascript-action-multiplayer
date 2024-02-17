import { Actor, Vector, Shape, CollisionType, Color } from "excalibur";
import { ANCHOR_TOP_LEFT, SCALE, SCALE_2x } from "@/constants";

export class Floor extends Actor {
  constructor(x: number, y: number, columns: number, rows: number) {
    const SIZE = 16;

    super({
      width: columns * SIZE,
      height: rows * SIZE,
      pos: new Vector(x * SIZE * SCALE, y * SIZE * SCALE),
      scale: SCALE_2x,
      anchor: ANCHOR_TOP_LEFT,
      collider: Shape.Box(columns * SIZE, rows * SIZE, Vector.Zero),
      collisionType: CollisionType.Fixed,
      color: Color.Red,
    });

    this.graphics.opacity = 0.0;
  }
}
