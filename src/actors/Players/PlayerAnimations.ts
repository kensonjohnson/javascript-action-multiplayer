import { Player } from "./Player";

export class PlayerAnimations {
  actor: Player;
  constructor(actor: Player) {
    this.actor = actor;
  }

  progressThroughActionAnimation(delta: number) {
    const { actor } = this;
    if (actor.actionAnimation) {
      actor.vel.x = 0;
      actor.vel.y = 0;
      actor.actionAnimation.work(delta);
    }
  }

  showRelevantAnimation() {
    const { actor } = this;

    // If a dedicated action is happening, show that animation
    if (actor.actionAnimation) {
      actor.graphics.use(actor.actionAnimation.frame);
      return;
    }

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
