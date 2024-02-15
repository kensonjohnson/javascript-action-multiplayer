import {
  Actor,
  Vector,
  Shape,
  CollisionType,
  Color,
  Engine,
  Keys,
} from "excalibur";
import { ANCHOR_CENTER, DOWN, Direction, SCALE_2x } from "@root/constants.ts";
import { DirectionQueue } from "@/classes/DirectionQueue";
// import { DrawShapeHelper } from "@/classes/DrawShapeHelper";
import {
  AnimationMap,
  generateCharacterAnimations,
} from "@/character-animations";
import { PlayerAnimations } from "./PlayerAnimations";

export class Player extends Actor {
  directionQueue: DirectionQueue;
  facing: Direction;
  skinAnimations: AnimationMap;
  playerAnimations?: PlayerAnimations;
  walkingMsLeft?: number;

  constructor(x: number, y: number, skinId: string) {
    super({
      pos: new Vector(x, y),
      width: 32,
      height: 32,
      scale: SCALE_2x,
      collider: Shape.Box(15, 15, ANCHOR_CENTER, new Vector(0, 6)),
      collisionType: CollisionType.Active,
      color: Color.Green,
    });

    this.directionQueue = new DirectionQueue();
    this.facing = DOWN;
    this.skinAnimations = generateCharacterAnimations(skinId);
    this.graphics.use(this.skinAnimations.DOWN.WALK);
  }

  onInitialize(_engine: Engine): void {
    // new DrawShapeHelper(this);
    this.playerAnimations = new PlayerAnimations(this);
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.directionQueue.update(engine);

    this.onPreUpdateMovementKeys(engine, delta);

    this.playerAnimations?.showRelevantAnimation();
  }

  onPreUpdateMovementKeys(engine: Engine, _delta: number) {
    const keyboard = engine.input.keyboard;
    const walkingSpeed = 160;

    this.vel.x = 0;
    this.vel.y = 0;
    if (keyboard.isHeld(Keys.Left)) {
      this.vel.x = -1;
    }
    if (keyboard.isHeld(Keys.Right)) {
      this.vel.x = 1;
    }
    if (keyboard.isHeld(Keys.Up)) {
      this.vel.y = -1;
    }
    if (keyboard.isHeld(Keys.Down)) {
      this.vel.y = 1;
    }

    // Normalize the walking speed
    if (this.vel.x !== 0 || this.vel.y !== 0) {
      this.vel = this.vel.normalize();
      this.vel.x *= walkingSpeed;
      this.vel.y *= walkingSpeed;
    }

    this.facing = this.directionQueue.direction ?? this.facing;
  }
}
