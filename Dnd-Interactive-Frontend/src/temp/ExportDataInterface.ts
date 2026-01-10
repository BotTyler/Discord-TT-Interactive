import { MapSchema } from "@colyseus/schema";
import { MapData } from "./Map";
import { Player } from "./Player";

export interface ExportDataInterface {
  map: MapData;
  players: MapSchema<Player>;
}
