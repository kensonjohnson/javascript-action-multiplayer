import {
  Actor,
  Vector,
  Shape,
  CollisionType,
  Color,
  Engine,
  Keys,
} from "excalibur";
import { ANCHOR_CENTER, DOWN, Direction, SCALE_2x } from "@/constants";
import { DirectionQueue } from "@/classes/DirectionQueue";
// import { DrawShapeHelper } from "@/classes/DrawShapeHelper";
import {
  AnimationMap,
  generateCharacterAnimations,
} from "@/character-animations";
import { PlayerAnimations } from "./PlayerAnimations";
import { PlayerActions } from "./PlayerActions";
import { SpriteSequence } from "@/classes/SpriteSequence";

const ACTION_1_KEY = Keys.Z;
const ACTION_2_KEY = Keys.X;

export class Player extends Actor {
  directionQueue: DirectionQueue;
  facing: Direction;
  actionAnimation: SpriteSequence | null;
  skinAnimations: AnimationMap;
  playerAnimations?: PlayerAnimations;
  playerActions?: PlayerActions;
  walkingMsLeft?: number;
  skinId: "RED" | "BLUE" | "GRAY" | "YELLOW";

  constructor(
    x: number,
    y: number,
    skinId: "RED" | "BLUE" | "GRAY" | "YELLOW"
  ) {
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
    this.actionAnimation = null;
    this.skinAnimations = generateCharacterAnimations(skinId);
    this.graphics.use(this.skinAnimations.DOWN.WALK);
    this.skinId = skinId;
  }

  onInitialize(_engine: Engine): void {
    // new DrawShapeHelper(this);
    this.playerAnimations = new PlayerAnimations(this);
    this.playerActions = new PlayerActions(this);
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.directionQueue.update(engine);

    // Work on dedicated animation if we are doing one
    this.playerAnimations?.progressThroughActionAnimation(delta);

    if (!this.actionAnimation) {
      this.onPreUpdateMovementKeys(engine, delta);
      this.onPreUpdateActionKeys(engine);
    }

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

  onPreUpdateActionKeys(engine: Engine) {
    // Register action keys
    if (engine.input.keyboard.wasPressed(ACTION_1_KEY)) {
      this.playerActions?.actionSwordSwing();
      return;
    }
    if (engine.input.keyboard.wasPressed(ACTION_2_KEY)) {
      this.playerActions?.actionShootArrow();
      return;
    }
    [
      {
        key: Keys.Digit1,
        skinId: "RED",
      },
      {
        key: Keys.Digit2,
        skinId: "BLUE",
      },
      {
        key: Keys.Digit3,
        skinId: "GRAY",
      },
      {
        key: Keys.Digit4,
        skinId: "YELLOW",
      },
    ].forEach(({ key, skinId }) => {
      if (engine.input.keyboard.wasPressed(key)) {
        this.skinId = skinId as "RED" | "BLUE" | "GRAY" | "YELLOW";
      }
      this.skinAnimations = generateCharacterAnimations(this.skinId);
    });
  }
}
