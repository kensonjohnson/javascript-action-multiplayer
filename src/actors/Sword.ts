import {
  DOWN,
  Direction,
  LEFT,
  RIGHT,
  SCALE,
  SCALE_2x,
  TAG_PLAYER_WEAPON,
  UP,
} from "@/constants";
import { Images } from "@/resources";
import {
  Actor,
  CollisionType,
  Shape,
  SpriteSheet,
  Vector,
  Animation,
} from "excalibur";
import { Player } from "./Players/Player";
import { NetworkPlayer } from "./Players/NetworkPlayer";

const swordSpriteSheet = SpriteSheet.fromImageSource({
  image: Images.swordSheetImage,
  grid: {
    columns: 3,
    rows: 4,
    spriteWidth: 32,
    spriteHeight: 32,
  },
});

export const SWORD_SWING_1 = "SWORD_SWING_1";
export const SWORD_SWING_2 = "SWORD_SWING_2";
export const SWORD_SWING_3 = "SWORD_SWING_3";

export class Sword extends Actor {
  direction: Direction;
  isUsed: boolean;
  owner: Player | NetworkPlayer | null;
  frames: {
    [direction in Direction]: {
      SWORD_SWING_1: Animation;
      SWORD_SWING_2: Animation;
      SWORD_SWING_3: Animation;
    };
  };

  constructor(x: number, y: number, direction: Direction) {
    super({
      pos: new Vector(x, y),
      width: 32,
      height: 32,
      scale: SCALE_2x,
      collider: Shape.Box(16, 16, Vector.Zero, new Vector(-8, -8)),
      collisionType: CollisionType.Passive,
    });
    this.direction = direction;
    this.isUsed = false;
    this.owner = null;
    this.addTag(TAG_PLAYER_WEAPON);

    this.frames = {
      DOWN: {
        [SWORD_SWING_1]: Animation.fromSpriteSheet(swordSpriteSheet, [0], 100),
        [SWORD_SWING_2]: Animation.fromSpriteSheet(swordSpriteSheet, [1], 100),
        [SWORD_SWING_3]: Animation.fromSpriteSheet(swordSpriteSheet, [2], 100),
      },
      UP: {
        [SWORD_SWING_1]: Animation.fromSpriteSheet(swordSpriteSheet, [3], 100),
        [SWORD_SWING_2]: Animation.fromSpriteSheet(swordSpriteSheet, [4], 100),
        [SWORD_SWING_3]: Animation.fromSpriteSheet(swordSpriteSheet, [5], 100),
      },
      LEFT: {
        [SWORD_SWING_1]: Animation.fromSpriteSheet(swordSpriteSheet, [6], 100),
        [SWORD_SWING_2]: Animation.fromSpriteSheet(swordSpriteSheet, [7], 100),
        [SWORD_SWING_3]: Animation.fromSpriteSheet(swordSpriteSheet, [8], 100),
      },
      RIGHT: {
        [SWORD_SWING_1]: Animation.fromSpriteSheet(swordSpriteSheet, [9], 100),
        [SWORD_SWING_2]: Animation.fromSpriteSheet(swordSpriteSheet, [10], 100),
        [SWORD_SWING_3]: Animation.fromSpriteSheet(swordSpriteSheet, [11], 100),
      },
    };

    this.graphics.use(this.frames[this.direction as Direction][SWORD_SWING_1]);

    // Nudge the sword to be in front of the player
    if (this.direction === DOWN) {
      this.pos.x -= 5 * SCALE;
      this.pos.y += 15 * SCALE;
    }
    if (this.direction === UP) {
      this.pos.x += 5 * SCALE;
      this.pos.y -= 6 * SCALE;
    }
    if (this.direction === LEFT) {
      this.pos.x -= 8 * SCALE;
      this.pos.y += 1 * SCALE;
    }
    if (this.direction === RIGHT) {
      this.pos.x += 8 * SCALE;
      this.pos.y += 1 * SCALE;
    }
  }

  onDamagedSomething() {
    this.isUsed = true;
  }

  useFrame(
    key: "SWORD_SWING_1" | "SWORD_SWING_2" | "SWORD_SWING_3",
    direction: Direction
  ) {
    this.graphics.use(this.frames[direction][key]);
  }
}
