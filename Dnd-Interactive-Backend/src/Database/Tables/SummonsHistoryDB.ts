import { mLatLng } from "../../shared/PositionInterface";
import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class SummonsHistoryDao extends DAO {
  private id?: number;
  private history_id: number;
  private summons_id: number;
  private player_id: string;
  private size: number;
  private position_lat: number;
  private position_lng: number;
  private health: number;
  private totalHealth: number;
  private deathSaves: number;
  private lifeSaves: number;
  private isVisible: boolean;

  constructor(
    history_id: number,
    summons_id: number,
    player_id: string,
    size: number,
    position: mLatLng,
    health: number,
    totalHealth: number,
    deathsaves: number,
    lifeSaves: number,
    isVisible: boolean,
    id?: number,
  ) {
    super();
    this.id = id;
    this.history_id = history_id;
    this.summons_id = summons_id;
    this.player_id = player_id;
    this.size = size;
    this.position_lat = position.lat;
    this.position_lng = position.lng;
    this.health = health;
    this.totalHealth = totalHealth;
    this.deathSaves = deathsaves;
    this.lifeSaves = lifeSaves;
    this.isVisible = isVisible;
  }

  getKeys(): string[] {
    return [
      "history_id",
      "summons_id",
      "player_id",
      "size",
      "position_lat",
      "position_lng",
      "health",
      "total_health",
      "death_saves",
      "life_saves",
      "is_visible",
    ];
  }
  getValues(): any[] {
    return [
      this.history_id,
      this.summons_id,
      this.player_id,
      this.size,
      this.position_lat,
      this.position_lng,
      this.health,
      this.totalHealth,
      this.deathSaves,
      this.lifeSaves,
      this.isVisible,
    ];
  }
  getIdName(): string {
    return "id";
  }
  getIdValue() {
    return this.id;
  }
}

export class SummonsHistoryDB extends DatabaseBase<SummonsHistoryDao> {
  private static instance: SummonsHistoryDB | undefined = undefined;
  public static getInstance(): SummonsHistoryDB {
    if (SummonsHistoryDB.instance === undefined) SummonsHistoryDB.instance = new SummonsHistoryDB();
    return SummonsHistoryDB.instance;
  }
  constructor() {
    super("Summons_History");
  }

  async selectByHistoryId(history_id: number) {
    const query = `SELECT * FROM public."Summons_History" as SH 
      join public."Summons" as S on SH.summons_id = S.summons_id 
      join public."Image_Catalog" as IC on S.image_id = IC.img_catalog_id 
        where SH.history_id = $1;`;
    console.log(query);

    const result: QueryResult<ShJoinInterface> | undefined = await Database.getInstance()
      .query(query, [history_id])
      .catch((e) => {
        console.error(`Could not ***select*** player movement history (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }
}

export interface ShJoinInterface {
  id: number;
  summons_id: number;
  history_id: number;
  player_id: string;
  size: number;
  enemy_id: number;
  position_lat: number;
  position_lng: number;
  name: string;
  image_name: string;
  health: number;
  total_health: number;
  death_saves: number;
  life_saves: number;
  is_visible: boolean;
}
