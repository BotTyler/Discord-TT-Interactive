import { Schema, type } from "@colyseus/schema";
import { mLatLng } from "./PositionInterface";
import { CharacterStatus } from "./StatusTypes";
import { MARKER_SIZE_CATEGORIES } from "./MarkerOptions";

export type TEnemyOptions = Pick<Enemy, "id" | "avatarUri" | "name" | "size_category">;

export class Enemy extends Schema {
  @type("number")
  public id: number;

  @type("string")
  public avatarUri: string;

  @type("string")
  public name: string;

  @type("string")
  public size_category: MARKER_SIZE_CATEGORIES;

  @type(mLatLng)
  public position: mLatLng;

  // This will be the position of the "ghost" player.
  // When this value is undefined the player is not wanting to move.
  // If this value is present the player is looking to move.
  @type([mLatLng])
  public toPosition: mLatLng[] = [];

  @type("number")
  public initiative: number;

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

  @type([CharacterStatus])
  public statuses: CharacterStatus[];

  // Init
  constructor({ avatarUri, id, name, size_category }: TEnemyOptions) {
    super();
    this.id = id;
    this.avatarUri = avatarUri;
    this.name = name;
    this.size_category = size_category;

    this.statuses = [];
    this.initiative = 1;
    this.position = new mLatLng(0, 0);
    this.health = 1;
    this.totalHealth = 1;
    this.lifeSaves = 0;
    this.deathSaves = 0;
    this.isVisible = true;
  }
}
