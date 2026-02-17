import { Schema, type } from "@colyseus/schema";

export type TMapOptions = Pick<
  MapData,
  "mapBase64" | "width" | "height" | "iconHeight" | "initiativeIndex"
>;

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

  @type("number")
  public initiativeIndex: number;

  // Init
  constructor({ mapBase64, width, height, iconHeight, initiativeIndex }: TMapOptions, id?: number) {
    super();
    this.mapBase64 = mapBase64;
    this.width = width;
    this.height = height;
    this.iconHeight = iconHeight;
    this.id = id;
    this.initiativeIndex = initiativeIndex;
  }
}
