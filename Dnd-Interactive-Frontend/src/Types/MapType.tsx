import { Enemy } from "dnd-interactive-shared";
import { Player } from "dnd-interactive-shared";

export interface MapDataInterface {
  mapName: string;
  base64: string;
  width: number;
  height: number;
  playerSize: number;
  playerPositions: { player: Player; x: number; y: number }[];
  EnemyPosition: { enemy: Enemy; x: number; y: number }[];
}
