import { ImageSource, Loader } from "excalibur";

export const Images = {
  redSheetImage: new ImageSource("sprites/character-red-sheet.png"),
  indoorImage: new ImageSource("maps/indoor.png"),
};

export const Sounds = {};

export const loader = new Loader();
loader.suppressPlayButton = true;
const allResources = { ...Images, ...Sounds };
for (const key in allResources) {
  loader.addResource(allResources[key as keyof typeof allResources]);
}
