import { Player } from "./Player";

export class PlayerAnimations {
  actor: Player;
  constructor(actor: Player) {
    this.actor = actor;
  }

  showRelevantAnimation() {
    const { actor } = this;

    actor.graphics.use(actor.skinAnimations[actor.facing].WALK);

    const walkingMsLeft = actor.walkingMsLeft ?? 0;
    if (actor.vel.x !== 0 || actor.vel.y !== 0 || walkingMsLeft > 0) {
      // @ts-expect-error
      actor.graphics.current[0].graphic.play();
      return;
    }

    // @ts-expect-error
    actor.graphics.current[0].graphic.pause();
    // @ts-expect-error
    actor.graphics.current[0].graphic.goToFrame(0);
  }
}
