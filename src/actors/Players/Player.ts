import {
  Actor,
  Vector,
  Shape,
  CollisionType,
  Color,
  Engine,
  Keys,
} from "excalibur";
import {
  ANCHOR_CENTER,
  DOWN,
  Direction,
  EVENT_SEND_PLAYER_UPDATE,
  LEFT,
  SCALE_2x,
  UP,
} from "@/constants";
import { DirectionQueue } from "@/classes/DirectionQueue";
// import { DrawShapeHelper } from "@/classes/DrawShapeHelper";
import {
  AnimationMap,
  generateCharacterAnimations,
} from "@/character-animations";
import { PlayerAnimations } from "./PlayerAnimations";
import { PlayerActions } from "./PlayerActions";
import { SpriteSequence } from "@/classes/SpriteSequence";
import { NetworkUpdater } from "@/classes/NetworkUpdater";

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
  isPainFlashing: boolean;
  painState?: {
    msLeft: number;
    painVelX: number;
    painVelY: number;
  };
  hasGhostPainState?: boolean;
  networkUpdater?: NetworkUpdater;

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
    this.isPainFlashing = false;
  }

  onInitialize(engine: Engine): void {
    // new DrawShapeHelper(this);
    this.playerAnimations = new PlayerAnimations(this);
    this.playerActions = new PlayerActions(this);
    this.networkUpdater = new NetworkUpdater(engine, EVENT_SEND_PLAYER_UPDATE);
  }

  // Concats enough information to send to other players
  createNetworkUpdaterString() {
    const actionType = this.actionAnimation?.type ?? "NULL";
    const isInPain = Boolean(this.painState);
    const x = Math.round(this.pos.x);
    const y = Math.round(this.pos.y);
    return `${actionType}|${x}|${y}|${this.vel.x}|${this.vel.y}|${this.skinId}|${this.facing}|${isInPain}|${this.isPainFlashing}`;
  }

  takeDamage() {
    // No pain if already in pain
    if (this.isPainFlashing) {
      return;
    }

    // Start new pain animation
    const PAIN_VELOCITY = 150;
    this.painState = {
      msLeft: 220,
      painVelX: this.facing === LEFT ? PAIN_VELOCITY : -PAIN_VELOCITY,
      painVelY: this.facing === UP ? PAIN_VELOCITY : -PAIN_VELOCITY,
    };

    // Flash for a little bit
    this.playerActions?.flashSeries();
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.directionQueue.update(engine);

    // Work on dedicated animation if we are doing one
    this.playerAnimations?.progressThroughActionAnimation(delta);

    if (!this.actionAnimation) {
      this.onPreUpdateMovement(engine, delta);
      this.onPreUpdateActionKeys(engine);
    }

    this.playerAnimations?.showRelevantAnimation();

    // Inform network updater
    const networkUpdaterString = this.createNetworkUpdaterString();
    this.networkUpdater?.sendStateUpdate(networkUpdaterString);
  }

  onPreUpdateMovement(engine: Engine, delta: number) {
    // Work down pain state
    if (this.painState) {
      this.vel.x = this.painState.painVelX;
      this.vel.y = this.painState.painVelY;

      // Work on getting rid of pain state
      this.painState.msLeft -= delta;
      if (this.painState.msLeft <= 0) {
        this.painState = undefined;
      }
      return;
    }

    const keyboard = engine.input.keyboard;
    const walkingSpeed = 160;

    this.vel.x = 0;
    this.vel.y = 0;
    if (keyboard.isHeld(Keys.Left)) {
      this.vel.x -= 1;
    }
    if (keyboard.isHeld(Keys.Right)) {
      this.vel.x += 1;
    }
    if (keyboard.isHeld(Keys.Up)) {
      this.vel.y -= 1;
    }
    if (keyboard.isHeld(Keys.Down)) {
      this.vel.y += 1;
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
        this.skinAnimations = generateCharacterAnimations(this.skinId);
      }
    });

    if (engine.input.keyboard.wasPressed(Keys.Space)) {
      this.takeDamage();
    }
  }
}
