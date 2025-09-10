import { MapSchema, Schema, type } from "@colyseus/schema";
import { Audio as gameAudio } from "./Audio";
import { MapData } from "./Map";
import { Player } from "./Player";

export interface IState {
  roomName: string;
  channelId: string;
}

export enum GameStateEnum {
  MAINMENU,
  HOSTPLAY,
  ALLPLAY,
}

export type MapMovementType = "free" | "grid";

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type(MapData)
  map: MapData | undefined = undefined;

  @type("number")
  gameState: GameStateEnum = GameStateEnum.MAINMENU;

  @type({ map: "string" })
  sessionToUserId = new MapSchema<string>();

  @type(gameAudio)
  gameAudio: gameAudio = new gameAudio();

  @type("string")
  mapMovement: MapMovementType = "free";

  @type("boolean")
  gridShowing: boolean = true;

  @type("string")
  gridColor: string = "rgba(255, 255, 255, 0.7)";

  @type("string")
  public roomName: string;

  @type("string")
  public channelId: string;

  // serverAttribute = "this attribute wont be sent to the client-side";

  @type("string")
  currentHostUserId: string | undefined;

  // Init
  constructor(attributes: IState) {
    super();
    this.roomName = attributes.roomName;
    this.channelId = attributes.channelId;
  }

}
