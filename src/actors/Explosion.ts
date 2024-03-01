import {
  Actor,
  Animation,
  AnimationStrategy,
  SpriteSheet,
  Vector,
  range,
} from "excalibur";
import { SCALE_2x } from "@/constants";
import { Images } from "@/resources";

const spriteSheet = SpriteSheet.fromImageSource({
  image: Images.explosionSheetImage,
  grid: {
    columns: 7,
    rows: 1,
    spriteWidth: 32,
    spriteHeight: 32,
  },
});

const EXPLOSION_ANIMATION_SPEED = 80;

export class Explosion extends Actor {
  constructor(x: number, y: number) {
    super({
      pos: new Vector(x, y),
      width: 32,
      height: 32,
      scale: SCALE_2x,
    });

    // Do the animation, then remove instance after it's done
    const explodeAnimation = Animation.fromSpriteSheet(
      spriteSheet,
      range(0, 6),
      EXPLOSION_ANIMATION_SPEED
    );
    explodeAnimation.strategy = AnimationStrategy.End;

    this.graphics.add("explode", explodeAnimation);
    const animation = this.graphics.getGraphic("explode") as Animation;
    animation.events.on("loop", () => {
      this.kill();
    });
    this.graphics.use(explodeAnimation);
  }
}
