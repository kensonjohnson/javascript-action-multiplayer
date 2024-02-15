import { Engine } from "excalibur";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, SCALE } from "@root/constants.ts";
import { Player } from "@/actors/Players/Player.ts";
import { Floor } from "@/actors/Floor.ts";

const game = new Engine({
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  fixedUpdateFps: 60,
  antialiasing: false, // Pixel art graphics
});

const player = new Player(200, 200, "BLUE");
game.add(player);

const floor = new Floor(1, 1, 1, 6);
game.add(floor);

// game.start(loader);
game.start();
