import { MapSchema, Schema, type } from "@colyseus/schema";
import { MapData } from "./Map";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { ExportDataInterface } from "./ExportDataInterface";
import { mLatLng } from "./PositionInterface";
import { PlayerSaveState, ShJoinInterface } from "./LoadDataInterfaces";

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
  // This value will hold the data based on a save.
  // In the case where a player joins AFTER a load is in progress, this is to make sure their data is not removed.
  lastSavedPlayerContext: PlayerSaveState[] = [];
  lastSavedSummonsContext: ShJoinInterface[] = [];
  sessionToUserId: Record<string, string> = {};

  @type({ map: Player })
  players: MapSchema<Player> = new MapSchema<Player>();

  @type({ map: Enemy })
  enemies: MapSchema<Enemy> = new MapSchema<Enemy>();

  @type(MapData)
  map: MapData | null = null;

  @type("number")
  gameState: GameStateEnum = GameStateEnum.MAINMENU;

  @type("string")
  mapMovement: MapMovementType = "free";

  @type("boolean")
  gridShowing: boolean = false;

  @type("string")
  gridColor: string = "rgba(255, 255, 255, 0.8)";

  @type("string")
  public roomName: string;

  @type("string")
  public channelId: string;

  @type("string")
  currentHostUserId: string | undefined = undefined;

  // Init
  constructor(attributes: IState) {
    super();
    this.roomName = attributes.roomName;
    this.channelId = attributes.channelId;
  }

  PANIC(): boolean {
    this.gameState = GameStateEnum.MAINMENU;
    this.currentHostUserId = undefined;

    return true;
  }

  // Compeltely reset all values related to a "playable" state.
  RESET_GAME(): boolean {
    this.players.forEach((player: Player): void => {
      player.position = new mLatLng(0, 0);
      player.statuses = [];
      player.summons = [];
      player.drawings = [];
      player.arcDrawing = null;
      player.beamDrawing = null;
      player.circleDrawing = null;
      player.cubeDrawing = null;
      player.deathSaves = 0;
      player.lifeSaves = 0;
      player.health = player.totalHealth;
    });
    this.enemies.clear();
    this.lastSavedPlayerContext = [];
    this.lastSavedSummonsContext = [];
    this.map = null;
    return true;
  }
  exportCurrentMapData(): ExportDataInterface | null {
    if (this.map === null) return null;
    const data: ExportDataInterface = {
      map: this.map,
      players: this.players,
      enemies: this.enemies,
    };

    return data;
  }

  getPlayerByUserId(clientID: string): Player | null {
    return this.players.get(clientID) ?? null;
  }
  getPlayerBySessionId(sessionId: string): Player | null {
    return this.players.get(this.sessionToUserId[sessionId] ?? "*") ?? null;
  }
}
