import { MapSchema } from "@colyseus/schema";
import { MapData } from "./Map";
import { Player } from "./Player";
import { Enemy } from "./Enemy";

export interface ExportDataInterface {
  map: MapData;
  players: MapSchema<Player>;
  enemies: MapSchema<Enemy>;
}
