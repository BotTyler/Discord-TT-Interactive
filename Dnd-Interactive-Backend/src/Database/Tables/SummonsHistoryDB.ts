import { mLatLng } from "../../shared/PositionInterface";
import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import { MARKER_SIZE_CATEGORIES } from "../../shared/MarkerOptions";

export class SummonsHistoryDao extends DAO {
  private id?: number;
  private history_id: number;
  private summons_id: number;
  private player_id: string;
  private size_category: MARKER_SIZE_CATEGORIES;
  private position_lat: number;
  private position_lng: number;
  private health: number;
  private totalHealth: number;
  private deathSaves: number;
  private lifeSaves: number;
  private isVisible: boolean;
  private statuses: string[];

  constructor(
    history_id: number,
    summons_id: number,
    player_id: string,
    size_category: MARKER_SIZE_CATEGORIES,
    position: mLatLng,
    health: number,
    totalHealth: number,
    deathsaves: number,
    lifeSaves: number,
    isVisible: boolean,
    statuses: string[],
    id?: number,
  ) {
    super();
    this.id = id;
    this.history_id = history_id;
    this.summons_id = summons_id;
    this.player_id = player_id;
    this.size_category = size_category;
    this.position_lat = position.lat;
    this.position_lng = position.lng;
    this.health = health;
    this.totalHealth = totalHealth;
    this.deathSaves = deathsaves;
    this.lifeSaves = lifeSaves;
    this.isVisible = isVisible;
    this.statuses = statuses;
  }

  getKeys(): string[] {
    return [
      "history_id",
      "summons_id",
      "player_id",
      "size_category",
      "position_lat",
      "position_lng",
      "health",
      "total_health",
      "death_saves",
      "life_saves",
      "is_visible",
      "statuses",
    ];
  }
  getValues(): any[] {
    return [
      this.history_id,
      this.summons_id,
      this.player_id,
      this.size_category,
      this.position_lat,
      this.position_lng,
      this.health,
      this.totalHealth,
      this.deathSaves,
      this.lifeSaves,
      this.isVisible,
      this.statuses,
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

    const result: QueryResult<ShJoinInterface> | null = await Database.getInstance()
      .query(query, [history_id])
      .catch((e) => {
        console.error(`Could not ***select*** player movement history (${this.tableName})\n\t${e}`);
        return null;
      });
    const rows: ShJoinInterface[] = result === null ? [] : result.rows;
    return rows.map((val: ShJoinInterface): ShJoinInterface => {
      return {
        id: +val.id,
        summons_id: +val.summons_id,
        player_id: val.player_id,
        history_id: +val.history_id,
        name: val.name,
        image_name: val.image_name,
        position_lat: +val.position_lat,
        position_lng: +val.position_lng,
        health: +val.health,
        total_health: +val.total_health,
        life_saves: +val.life_saves,
        death_saves: +val.death_saves,
        size_category: val.size_category,
        is_visible: val.is_visible,
        statuses: val.statuses,
      };
    });
  }
}

export interface ShJoinInterface {
  id: number;
  summons_id: number;
  history_id: number;
  player_id: string;
  size_category: MARKER_SIZE_CATEGORIES;
  position_lat: number;
  position_lng: number;
  name: string;
  image_name: string;
  health: number;
  total_health: number;
  death_saves: number;
  life_saves: number;
  is_visible: boolean;
  statuses: string[];
}
