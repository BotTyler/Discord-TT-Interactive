import { MapSchema, Schema, type } from "@colyseus/schema";
import { mLatLng } from "./PositionInterface";
import { Enemy } from "./Enemy";

// export interface ClientMapDataInterface {
//   mapBase64: string;
//   height: number;
//   width: number;
//   iconHeight: number;
//   initiative_index: number;
//   playerData: { [key: string]: mLatLng };
// }

export class MapFogPolygon extends Schema {
  @type("number")
  public id: number;
  @type([mLatLng])
  public points: mLatLng[];
  @type("boolean")
  public isVisible: boolean;
  constructor(points: mLatLng[], isVisible: boolean, id: number) {
    super();
    this.points = points;
    this.isVisible = isVisible;
    this.id = id;
  }
}

export type TMapOptions = Pick<MapData, "mapBase64" | "width" | "height" | "iconHeight" | "fogs" | "enemy" | "initiativeIndex">;

export class MapData extends Schema {
  public id?: number;

  @type("string")
  public mapBase64: string;
  @type("number")
  public width: number;

  @type("number")
  public height: number;

  @type("number")
  public iconHeight: number;

  @type({ map: MapFogPolygon })
  public fogs: MapSchema<MapFogPolygon>;

  @type({ map: Enemy })
  public enemy: MapSchema<Enemy>;

  @type("number")
  public initiativeIndex: number;

  // Init
  constructor({ mapBase64, width, height, iconHeight, fogs, enemy, initiativeIndex }: TMapOptions, id?: number) {
    super();
    this.mapBase64 = mapBase64;
    this.width = width;
    this.height = height;
    this.iconHeight = iconHeight;
    this.fogs = fogs ?? {};
    this.enemy = enemy ?? {};
    this.id = id;
    this.initiativeIndex = initiativeIndex;
  }
}
