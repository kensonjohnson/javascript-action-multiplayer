import { ARROWACTION, SWORD1, SWORD2, SWORDACTION } from "@/constants";
import { Engine } from "excalibur";
import { Player } from "./Player";
import { SpriteSequence } from "@/classes/SpriteSequence";
import { SWORD_SWING_1, SWORD_SWING_2, SWORD_SWING_3, Sword } from "../Sword";
import { Arrow } from "../Arrow";
import { NetworkPlayer } from "./NetworkPlayer";

export class PlayerActions {
  actor: Player | NetworkPlayer;
  engine: Engine;

  constructor(actor: Player | NetworkPlayer) {
    this.actor = actor;
    this.engine = actor.scene.engine;
  }
  actionSwordSwing() {
    const SWORD_SWING_SPEED = 50;
    const { actor, engine } = this;

    // Create new sequence with dedicated callback per frame
    actor.actionAnimation = new SpriteSequence(
      SWORDACTION,
      [
        {
          frame: actor.skinAnimations[actor.facing][SWORD1],
          duration: SWORD_SWING_SPEED,
          actorObjectCallback: (swordInstance) => {
            // Change sword's frame to match character on frame 1
            swordInstance.useFrame(SWORD_SWING_1, actor.facing);
          },
        },
        {
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: SWORD_SWING_SPEED,
          actorObjectCallback: (swordInstance) => {
            // Change sword's frame to match character on frame 1
            swordInstance.useFrame(SWORD_SWING_2, actor.facing);
          },
        },
        {
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: SWORD_SWING_SPEED * 2,
          actorObjectCallback: (swordInstance) => {
            // Change sword's frame to match character on frame 1
            swordInstance.useFrame(SWORD_SWING_3, actor.facing);
          },
        },
      ],
      (swordInstance) => {
        // When series is over, clear out animation and remove sword
        actor.actionAnimation = null;
        swordInstance.kill();
      }
    );

    // Add sword to scene
    const sword = new Sword(actor.pos.x, actor.pos.y, actor.facing);
    engine.add(sword);
    sword.owner = actor;

    // Assign this sword instance to be controllable by each frame above
    actor.actionAnimation.actorObject = sword;
  }

  actionShootArrow() {
    const SHOOT_ARROW_SPEED = 155;
    const { actor, engine } = this;

    // Create new sequence with dedicated callback per frame
    actor.actionAnimation = new SpriteSequence(
      ARROWACTION,
      [
        {
          frame: actor.skinAnimations[actor.facing][SWORD1],
          duration: SHOOT_ARROW_SPEED,
          actorObjectCallback: () => {},
        },
        {
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: SHOOT_ARROW_SPEED,
          actorObjectCallback: () => {
            const arrow = new Arrow(actor.pos.x, actor.pos.y, actor.facing);
            arrow.owner = actor;
            engine.add(arrow);
          },
        },
      ],
      () => {
        actor.actionAnimation = null;
      }
    );
  }

  async flashSeries() {
    const { actor } = this;
    actor.isPainFlashing = true;
    const PAIN_FLASH_SPEED = 100;
    for (let i = 0; i <= 4; i++) {
      actor.graphics.opacity = 0;
      await actor.actions.delay(PAIN_FLASH_SPEED).toPromise();
      actor.graphics.opacity = 1;
      await actor.actions.delay(PAIN_FLASH_SPEED).toPromise();
    }
    actor.isPainFlashing = false;
  }
}
