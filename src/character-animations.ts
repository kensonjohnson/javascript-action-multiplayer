import { SpriteSheet, Animation } from "excalibur";
import { Images } from "./resources.ts";
import {
  DOWN,
  Direction,
  LEFT,
  PAIN,
  RIGHT,
  SWORD1,
  SWORD2,
  UP,
  ValidAnimation,
  WALK,
} from "@/constants.ts";

const WALK_ANIMATION_SPEED = 150;
const characterSpriteSheetGridConfig = {
  columns: 10,
  rows: 10,
  spriteWidth: 32,
  spriteHeight: 32,
};

const redSpriteSheet = SpriteSheet.fromImageSource({
  image: Images.redSheetImage,
  grid: characterSpriteSheetGridConfig,
});
const blueSpriteSheet = SpriteSheet.fromImageSource({
  image: Images.blueSheetImage,
  grid: characterSpriteSheetGridConfig,
});
const graySpriteSheet = SpriteSheet.fromImageSource({
  image: Images.graySheetImage,
  grid: characterSpriteSheetGridConfig,
});
const yellowSpriteSheet = SpriteSheet.fromImageSource({
  image: Images.yellowSheetImage,
  grid: characterSpriteSheetGridConfig,
});

const SPRITE_SHEET_MAP = {
  RED: redSpriteSheet,
  BLUE: blueSpriteSheet,
  GRAY: graySpriteSheet,
  YELLOW: yellowSpriteSheet,
};

const ANIMATION_CONFIGS = {
  [DOWN]: {
    WALK: [[0, 1], WALK_ANIMATION_SPEED],
    SWORD1: [[2], WALK_ANIMATION_SPEED],
    SWORD2: [[3], WALK_ANIMATION_SPEED],
    PAIN: [[4], WALK_ANIMATION_SPEED],
  },
  [UP]: {
    WALK: [[10, 11], WALK_ANIMATION_SPEED],
    SWORD1: [[12], WALK_ANIMATION_SPEED],
    SWORD2: [[13], WALK_ANIMATION_SPEED],
    PAIN: [[14], WALK_ANIMATION_SPEED],
  },
  [LEFT]: {
    WALK: [[20, 21], WALK_ANIMATION_SPEED],
    SWORD1: [[22], WALK_ANIMATION_SPEED],
    SWORD2: [[23], WALK_ANIMATION_SPEED],
    PAIN: [[24], WALK_ANIMATION_SPEED],
  },
  [RIGHT]: {
    WALK: [[30, 31], WALK_ANIMATION_SPEED],
    SWORD1: [[32], WALK_ANIMATION_SPEED],
    SWORD2: [[33], WALK_ANIMATION_SPEED],
    PAIN: [[34], WALK_ANIMATION_SPEED],
  },
};

export type AnimationMap = {
  [key in Direction]: {
    [key in ValidAnimation]: Animation;
  };
};

export function generateCharacterAnimations(
  spriteSheetKey: string
): AnimationMap {
  const sheet =
    SPRITE_SHEET_MAP[spriteSheetKey as keyof typeof SPRITE_SHEET_MAP];
  let payload: AnimationMap = {} as AnimationMap;
  [UP, DOWN, LEFT, RIGHT].forEach((direction) => {
    payload[direction as keyof typeof payload] = {} as {
      [key in ValidAnimation]: Animation;
    };
    [WALK, SWORD1, SWORD2, PAIN].forEach((animation) => {
      const [frames, speed] = ANIMATION_CONFIGS[direction][animation];
      payload[direction]![animation] = Animation.fromSpriteSheet(
        sheet,
        [...(frames as number[])],
        speed as number
      );
    });
  });
  return payload;
}

const monsterSpriteSheet = SpriteSheet.fromImageSource({
  image: Images.monsterSheetImage,
  grid: {
    columns: 4,
    rows: 4,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const MONSTER_ANIMATION_SPEED = 300;

export function generateMonsterAnimations() {
  return {
    [WALK]: {
      [DOWN]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [0, 1],
        MONSTER_ANIMATION_SPEED
      ),
      [UP]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [4, 5],
        MONSTER_ANIMATION_SPEED
      ),
      [LEFT]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [8, 9],
        MONSTER_ANIMATION_SPEED
      ),
      [RIGHT]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [12, 13],
        MONSTER_ANIMATION_SPEED
      ),
    },
    [PAIN]: {
      [DOWN]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [2, 3],
        MONSTER_ANIMATION_SPEED
      ),
      [UP]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [6, 7],
        MONSTER_ANIMATION_SPEED
      ),
      [LEFT]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [10, 11],
        MONSTER_ANIMATION_SPEED
      ),
      [RIGHT]: Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [14, 15],
        MONSTER_ANIMATION_SPEED
      ),
    },
  };
}
