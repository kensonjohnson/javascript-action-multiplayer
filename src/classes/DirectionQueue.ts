import { Engine, Input, Keys } from "excalibur";
import { UP, DOWN, LEFT, RIGHT, Direction } from "@/constants";

export class DirectionQueue {
  heldDirections: Direction[];
  constructor() {
    this.heldDirections = [];
  }

  get direction() {
    return this.heldDirections[0] ?? null;
  }

  add(givenDirection: Direction) {
    const exists = this.heldDirections.includes(givenDirection);
    if (exists) {
      return;
    }
    this.heldDirections.unshift(givenDirection);
  }

  remove(givenDirection: Direction) {
    this.heldDirections = this.heldDirections.filter(
      (direction) => direction !== givenDirection
    );
  }

  update(engine: Engine) {
    [
      { key: Keys.Left, direction: LEFT },
      { key: Keys.Right, direction: RIGHT },
      { key: Keys.Up, direction: UP },
      { key: Keys.Down, direction: DOWN },
    ].forEach((group) => {
      if (engine.input.keyboard.wasPressed(group.key)) {
        this.add(group.direction);
      }
      if (engine.input.keyboard.wasReleased(group.key)) {
        this.remove(group.direction);
      }
    });
  }
}
