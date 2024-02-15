import { Actor, BoundingBox, Color, vec } from "excalibur";

export class DrawShapeHelper {
  constructor(actor: Actor) {
    actor.scene.on("postdraw", ({ ctx }) => {
      const bounds = actor.collider.bounds;
      const { x: left, y: top } =
        actor.scene.engine.screen.worldToScreenCoordinates(
          vec(bounds.left, bounds.top)
        );
      const { x: right, y: bottom } =
        actor.scene.engine.screen.worldToScreenCoordinates(
          vec(bounds.right, bounds.bottom)
        );
      const newBounds = new BoundingBox({ left, top, right, bottom });
      newBounds.draw(ctx, Color.Yellow);
    });
  }
}
