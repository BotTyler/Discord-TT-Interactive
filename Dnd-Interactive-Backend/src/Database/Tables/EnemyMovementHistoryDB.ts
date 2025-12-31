import { mLatLng } from "../../shared/PositionInterface";
import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class EnemyMovementHistoryDAO extends DAO {
  private id?: number;
  private history_id: number;
  private enemy_id: number;
  private size: number;
  private position_lat: number;
  private position_lng: number;
  private initiaitive: number;
  private health: number;
  private totalHealth: number;
  private deathSaves: number;
  private lifeSaves: number;
  private isVisible: boolean;

  constructor(
    history_id: number,
    enemy_id: number,
    size: number,
    position: mLatLng,
    initiative: number,
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
    this.enemy_id = enemy_id;
    this.size = size;
    this.position_lat = position.lat;
    this.position_lng = position.lng;
    this.initiaitive = initiative;
    this.health = health;
    this.totalHealth = totalHealth;
    this.deathSaves = deathsaves;
    this.lifeSaves = lifeSaves;
    this.isVisible = isVisible;
  }

  getKeys(): string[] {
    return [
      "history_id",
      "enemy_id",
      "size",
      "position_lat",
      "position_lng",
      "initiative",
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
      this.enemy_id,
      this.size,
      this.position_lat,
      this.position_lng,
      this.initiaitive,
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

export class EnemyMovementHistoryDB extends DatabaseBase<EnemyMovementHistoryDAO> {
  private static instance: EnemyMovementHistoryDB | undefined = undefined;
  public static getInstance(): EnemyMovementHistoryDB {
    if (EnemyMovementHistoryDB.instance === undefined)
      EnemyMovementHistoryDB.instance = new EnemyMovementHistoryDB();
    return EnemyMovementHistoryDB.instance;
  }
  constructor() {
    super("Enemy_Movement_History");
  }

  async getEnemyMovementAtHistoryId(history_id: number) {
    const query = `SELECT * FROM public."Enemy_Movement_History" as EMH join public."Enemy" as E on EMH.enemy_id = E.enemy_id join public."Image_Catalog" as IC on E.image_id = IC.img_catalog_id where EMH.history_id = $1;`;
    console.log(query);

    const result: QueryResult<EmhJoinInterface> | undefined = await Database.getInstance()
      .query(query, [history_id])
      .catch((e) => {
        console.error(`Could not ***select*** player movement history (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }
}

export interface EmhJoinInterface {
  id: number;
  history_id: number;
  size: number;
  enemy_id: number;
  position_lat: number;
  position_lng: number;
  name: string;
  image_name: string;
  initiative: number;
  health: number;
  total_health: number;
  death_saves: number;
  life_saves: number;
  is_visible: boolean;
}
