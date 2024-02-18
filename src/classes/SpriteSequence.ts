import { Sword } from "@/actors/Sword";
import { Animation } from "excalibur";

type FrameAnimation = {
  frame: Animation;
  duration: number;
  actorObjectCallback?: (actorObject: Sword) => void;
};

export class SpriteSequence {
  type: string;
  frameAnimations: FrameAnimation[];
  currentFrameIndex: number;
  currentFromProgress: number;
  isDone: boolean;
  onDone: () => void;
  actorObject: Sword | null;

  constructor(
    type: string,
    frameAnimations = [] as FrameAnimation[],
    onDone: (actorObject: Sword) => void
  ) {
    this.type = type;
    this.frameAnimations = frameAnimations;
    this.currentFrameIndex = 0;
    this.currentFromProgress = 0;
    this.isDone = false;
    this.onDone = () => {
      this.isDone = true;
      onDone(this.actorObject!);
    };

    this.actorObject = null;
  }

  get frame() {
    return this.frameAnimations[this.currentFrameIndex].frame;
  }

  work(delta: number) {
    if (this.isDone) return;

    const currentFrameDuration =
      this.frameAnimations[this.currentFrameIndex].duration;

    // Work on the current frame
    if (this.currentFromProgress < currentFrameDuration) {
      this.currentFromProgress += delta;
      return;
    }

    if (this.currentFrameIndex + 1 < this.frameAnimations.length) {
      this.currentFrameIndex++;
      this.currentFromProgress = 0;
      // Do new frame callback
      const nextConfig = this.frameAnimations[this.currentFrameIndex];
      if (nextConfig.actorObjectCallback) {
        nextConfig.actorObjectCallback(this.actorObject!);
      }
      return;
    }
    this.onDone();
  }
}
