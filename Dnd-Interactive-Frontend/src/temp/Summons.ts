import { Schema, type } from "@colyseus/schema";
import { mLatLng } from "./PositionInterface";

export type TSummonsOptions = Pick<
  Summons,
  | "id"
  | "player_id"
  | "avatarUri"
  | "name"
  | "position"
  | "size"
  | "color"
  | "health"
  | "totalHealth"
  | "lifeSaves"
  | "deathSaves"
  | "isVisible"
>;

export class Summons extends Schema {
  @type("number")
  public id: number;

  @type("string")
  public player_id: string;

  @type("string")
  public avatarUri: string;

  @type("string")
  public name: string;

  @type("number")
  public size: number;

  @type("string")
  public color: string;

  @type(mLatLng)
  public position: mLatLng;

  // This will be the position of the "ghost" player.
  // When this value is undefined the player is not wanting to move.
  // If this value is present the player is looking to move.
  @type([mLatLng])
  public toPosition: mLatLng[] = [];

  @type("number")
  public health: number;

  @type("number")
  public totalHealth: number;

  @type("number")
  public deathSaves: number;

  @type("number")
  public lifeSaves: number;

  @type("boolean")
  public isVisible: boolean;

  // Init
  constructor({
    avatarUri,
    id,
    name,
    position,
    size,
    color,
    player_id,
    health,
    totalHealth,
    lifeSaves,
    deathSaves,
    isVisible,
  }: TSummonsOptions) {
    super();
    this.id = id;
    this.avatarUri = avatarUri;
    this.name = name;
    this.position = position ?? new mLatLng(0, 0);
    this.size = size;
    this.color = color;
    this.player_id = player_id;
    this.health = health ?? 1;
    this.totalHealth = totalHealth ?? 1;
    this.lifeSaves = lifeSaves ?? 0;
    this.deathSaves = deathSaves ?? 0;
    this.isVisible = isVisible ?? true;
  }
}
