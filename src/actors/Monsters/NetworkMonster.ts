import { Actor, Animation, Engine, Vector } from "excalibur";
import {
  DOWN,
  Direction,
  PAIN,
  SCALE_2x,
  TAG_DAMAGES_PLAYER,
  WALK,
} from "@/constants";
import { generateMonsterAnimations } from "@/character-animations";
import { Explosion } from "../Explosion";

// Note this class simply shows a known Monster which is controlled by another player.
export class NetworkMonster extends Actor {
  hasPainState: boolean;
  facing: Direction;
  animations: {
    [key: string]: {
      [key: string]: Animation;
    };
  };
  constructor(x: number, y: number) {
    super({
      pos: new Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
    });
    this.hasPainState = false;
    this.facing = DOWN;
    this.animations = generateMonsterAnimations();
  }

  onInitialize(_engine: Engine) {
    this.addTag(TAG_DAMAGES_PLAYER);
  }

  tookFinalDamage() {
    // Replace me with an explosion when owner client reports I am out of HP
    this.kill();
    this.scene?.engine?.add(new Explosion(this.pos.x, this.pos.y));
  }

  onPreUpdate(_engine: Engine, _delta: number) {
    // Show correct appearance
    const use = this.animations[this.hasPainState ? PAIN : WALK][this.facing];
    this.graphics.use(use);
  }
}
