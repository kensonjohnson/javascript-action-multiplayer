import { Engine } from "excalibur";
import {
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  SCALE,
  EVENT_SEND_PLAYER_UPDATE,
  TAG_ANY_PLAYER,
  EVENT_SEND_MONSTER_UPDATE,
} from "@/constants";
import { Player } from "@/actors/Players/Player.ts";
import { loader } from "@/resources.ts";
import { Map_Indoor } from "./maps/Map_Indoor";
import { Player_CameraStrategy } from "./classes/Player_CameraStrategy";
import { NetworkClient } from "./classes/NetworkClient";
import { NetworkActorsMap } from "./classes/NetworkActorsMap";
import { Monster } from "./actors/Monsters/Monster";

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

  // Set up ability to query for certain actors on the fly
  game.currentScene.world.queryManager.createQuery([TAG_ANY_PLAYER]);

  // Create player state list and network listener
  new NetworkActorsMap(game);
  const peer = new NetworkClient(game);

  // When one of my nodes update, send it to all players
  game.on(EVENT_SEND_PLAYER_UPDATE, (update: any) => {
    peer.sendUpdate(update);
  });

  game.on(EVENT_SEND_MONSTER_UPDATE, (update: any) => {
    peer.sendUpdate(update);
  });
});

// game.start(loader);
game.start(loader);

function createAddMonsterButton() {
  const button = document.createElement("button");
  button.onclick = () => {
    const monster = new Monster(100, 100);
    game.add(monster);
  };
  button.style.display = "block";
  button.innerText = "Add Monster";
  document.body.appendChild(button);
}
createAddMonsterButton();
