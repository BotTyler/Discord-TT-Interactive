import { ArraySchema, Schema, type } from "@colyseus/schema";

export class Audio extends Schema {
  @type("number")
  currentAudioIndex: number;

  @type({ array: "string" })
  queue: ArraySchema<string>; // adding this need listeners on the client side
  @type("boolean")
  isPlaying: boolean;
  @type("number")
  currentTimestamp: number;

  // Init
  constructor() {
    super();
    this.currentAudioIndex = 0;
    this.isPlaying = false;
    this.currentTimestamp = 0;
    this.queue = new ArraySchema<string>();
  }
}
