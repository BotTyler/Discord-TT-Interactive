import { ArraySchema, Schema, type } from "@colyseus/schema";
import { mLatLng } from "./PositionInterface";
import { ArcDrawing, CircleDrawing, CubeDrawing } from "./DrawingInterface";
export type TPlayerOptions = Pick<Player, "name" | "sessionId" | "userId" | "avatarUri" | "position" | "color" | "drawings" | "initiative" | "circleDrawing" | "cubeDrawing" | "arcDrawing" | "health" | "totalHealth" | "lifeSaves" | "deathSaves" | "isConnected">;

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

  @type([mLatLng])
  public drawings: mLatLng[];

  @type(CircleDrawing)
  public circleDrawing: CircleDrawing | undefined;

  @type(CubeDrawing)
  public cubeDrawing: CubeDrawing | undefined;

  @type(ArcDrawing)
  public arcDrawing: ArcDrawing | undefined;

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

  constructor({ name, userId, avatarUri, sessionId, position, color, drawings, initiative, circleDrawing, cubeDrawing, arcDrawing, health, totalHealth, lifeSaves, deathSaves, isConnected }: TPlayerOptions) {
    super();
    this.userId = userId;
    this.avatarUri = avatarUri;
    this.name = name;
    this.sessionId = sessionId;
    this.position = position ?? new mLatLng(0, 0);
    this.color = color ?? "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
    this.drawings = drawings ?? new ArraySchema<mLatLng>();
    this.initiative = initiative ?? 0;

    // possibility of undefined value
    this.circleDrawing = circleDrawing;
    this.cubeDrawing = cubeDrawing;
    this.arcDrawing = arcDrawing;
    this.health = health ?? 1;
    this.totalHealth = totalHealth ?? 1;
    this.lifeSaves = lifeSaves ?? 0;
    this.deathSaves = deathSaves ?? 0;
    this.isConnected = isConnected ?? true;
  }
}
