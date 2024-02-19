import { Engine } from "excalibur";

export class NetworkUpdater {
  engine: Engine;
  eventType: string;
  previousString: string;

  constructor(engine: Engine, eventType: string) {
    this.engine = engine;
    this.eventType = eventType;
    this.previousString = "";
  }

  sendStateUpdate(newString: string) {
    if (this.previousString === newString) {
      return;
    }
    console.log(newString);
    this.engine.emit(this.eventType, newString);
    this.previousString = newString;
  }
}
