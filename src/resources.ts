import { ImageSource, Loader } from "excalibur";

export const Images = {
  // Characters
  redSheetImage: new ImageSource("sprites/character-red-sheet.png"),

  // Maps
  indoorImage: new ImageSource("maps/indoor.png"),

  // Weapons
  swordSheetImage: new ImageSource("sprites/sword-sheet.png"),
  arrowSheetImage: new ImageSource("sprites/arrow-sheet.png"),
};

export const Sounds = {};

export const loader = new Loader();
loader.suppressPlayButton = true;
const allResources = { ...Images, ...Sounds };
for (const key in allResources) {
  loader.addResource(allResources[key as keyof typeof allResources]);
}
