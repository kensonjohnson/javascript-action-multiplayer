import { Animation, SpriteSheet, Actor, Vector, Engine } from "excalibur";
import { Images } from "@/resources.js";
import {
  DOWN,
  Direction,
  LEFT,
  RIGHT,
  SCALE,
  SCALE_2x,
  TAG_PLAYER_WEAPON,
  UP,
} from "@/constants.js";
import { Player } from "./Players/Player";
import { NetworkPlayer } from "./Players/NetworkPlayer";

const arrowSpriteSheet = SpriteSheet.fromImageSource({
  image: Images.arrowSheetImage,
  grid: {
    columns: 1,
    rows: 4,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const arrowDownAnim = Animation.fromSpriteSheet(arrowSpriteSheet, [0], 100);
const arrowUpAnim = Animation.fromSpriteSheet(arrowSpriteSheet, [1], 100);
const arrowLeftAnim = Animation.fromSpriteSheet(arrowSpriteSheet, [2], 100);
const arrowRightAnim = Animation.fromSpriteSheet(arrowSpriteSheet, [3], 100);

export class Arrow extends Actor {
  owner: Player | NetworkPlayer | null;
  msRemaining: number;

  constructor(x: number, y: number, direction: Direction) {
    super({
      pos: new Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
    });

    this.addTag(TAG_PLAYER_WEAPON);
    this.owner = null; // Assigned on creation by body who creates this.

    // Expire after so much time
    this.msRemaining = 2000;

    // Travel in direction
    const ARROW_VELOCITY = 300;
    if (direction === DOWN) {
      this.graphics.use(arrowDownAnim);
      this.vel.y = ARROW_VELOCITY;
      this.pos.y += SCALE * 4;
    }
    if (direction === UP) {
      this.graphics.use(arrowUpAnim);
      this.vel.y = -ARROW_VELOCITY;
    }
    if (direction === LEFT) {
      this.graphics.use(arrowLeftAnim);
      this.vel.x = -ARROW_VELOCITY;
      this.pos.y += SCALE * 4;
    }
    if (direction === RIGHT) {
      this.graphics.use(arrowRightAnim);
      this.vel.x = ARROW_VELOCITY;
      this.pos.y += SCALE * 4;
    }
  }

  // Remove me if I hit something
  onDamagedSomething() {
    this.kill();
  }

  onPreUpdate(_engine: Engine, delta: number) {
    // Remove after time has passed.
    // Fun note: originally tried this when the arrow goes "off screen", but it's not necessarily off-screen for other players
    this.msRemaining -= delta;
    if (this.msRemaining <= 0) {
      this.kill();
    }
  }
}
