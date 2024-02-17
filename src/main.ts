import { Engine } from "excalibur";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, SCALE } from "@/constants";
import { Player } from "@/actors/Players/Player.ts";
import { loader } from "@/resources.ts";
import { Map_Indoor } from "./maps/Map_Indoor";
import { Player_CameraStrategy } from "./classes/Player_CameraStrategy";

const game = new Engine({
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  fixedUpdateFps: 60,
  antialiasing: false, // Pixel art graphics
});
const map = new Map_Indoor();
game.add(map);

const player = new Player(200, 200, "RED");
game.add(player);

game.on("initialize", () => {
  const cameraStrategy = new Player_CameraStrategy(player, map);
  game.currentScene.camera.addStrategy(cameraStrategy);
});

// game.start(loader);
game.start(loader);
