import { Enemy } from "../../src/shared/Enemy"
import { Player } from "../../src/shared/Player"

export interface MapDataInterface {
  mapName: string;
  base64: string;
  width: number;
  height: number;
  playerSize: number;
  playerPositions: { player: Player; x: number; y: number }[];
  EnemyPosition: { enemy: Enemy; x: number; y: number }[];
}
