import { Schema, type } from "@colyseus/schema";
import { ArcDrawing, BeamDrawing, CircleDrawing, CubeDrawing } from "./DrawingInterface";
import { mLatLng } from "./PositionInterface";
import { CharacterStatus } from "./StatusTypes";
import { Summons } from "./Summons";
export type TPlayerOptions = Pick<Player, "name" | "sessionId" | "userId" | "avatarUri">;
export class Player extends Schema {
  @type("string")
  public name: string;

  @type("string")
  public sessionId: string;

  @type("string")
  public userId: string;

  @type("string")
  public avatarUri: string;

  @type("boolean")
  public isHost: boolean = false; // may remove this option

  @type("string")
  public color: string;

  @type("boolean")
  public isConnected: boolean;

  @type(mLatLng)
  public position: mLatLng;

  // This will be the position of the "ghost" player.
  // When this value is undefined the player is not wanting to move.
  // If this value is present the player is looking to move.
  @type([mLatLng])
  public toPosition: mLatLng[] = [];

  @type([mLatLng])
  public drawings: mLatLng[];

  @type(CircleDrawing)
  public circleDrawing: CircleDrawing | null;

  @type(CubeDrawing)
  public cubeDrawing: CubeDrawing | null;

  @type(ArcDrawing)
  public arcDrawing: ArcDrawing | null;

  @type(BeamDrawing)
  public beamDrawing: BeamDrawing | null;

  @type("number")
  public initiative: number;

  @type("number")
  public health: number;

  @type("number")
  public totalHealth: number;

  @type("number")
  public lifeSaves: number;

  @type("number")
  public deathSaves: number;

  @type([Summons])
  public summons: Summons[];

  @type([CharacterStatus])
  public statuses: CharacterStatus[];

  constructor({ name, userId, avatarUri, sessionId }: TPlayerOptions) {
    super();
    this.userId = userId;
    this.avatarUri = avatarUri;
    this.name = name;
    this.sessionId = sessionId;

    // Preset values
    this.position = new mLatLng(0, 0);
    this.color = "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substring(0, 6);
    this.drawings = [];
    this.initiative = 0;
    this.circleDrawing = null;
    this.cubeDrawing = null;
    this.arcDrawing = null;
    this.beamDrawing = null;
    this.statuses = [];
    this.health = 1;
    this.totalHealth = 1;
    this.lifeSaves = 0;
    this.deathSaves = 0;
    this.isConnected = true;
    this.summons = [];
  }
}
