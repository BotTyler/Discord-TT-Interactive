import { mLatLng } from "../../shared/PositionInterface";
import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import { PlayerSaveState } from "../../shared/LoadDataInterfaces";

export class PlayerMovementHistoryDAO extends DAO {
  public readonly pmh_id?: number;
  public readonly history_id: number;
  public readonly player_id: string;
  public readonly position_lat: number;
  public readonly position_lng: number;
  public readonly initiative: number;
  public readonly health: number;
  public readonly totalHealth: number;
  public readonly deathSaves: number;
  public readonly lifeSaves: number;
  public readonly statuses: string[];

  constructor(
    history_id: number,
    player_id: string,
    position: mLatLng,
    initiative: number,
    health: number,
    totalHealth: number,
    deathSaves: number,
    lifeSaves: number,
    statuses: string[],
    id?: number,
  ) {
    super();
    this.pmh_id = id;
    this.history_id = history_id;
    this.player_id = player_id;
    this.position_lat = position.lat;
    this.position_lng = position.lng;
    this.initiative = initiative;
    this.health = health;
    this.totalHealth = totalHealth;
    this.deathSaves = deathSaves;
    this.lifeSaves = lifeSaves;
    this.statuses = statuses;
  }

  getKeys(): string[] {
    return [
      "history_id",
      "player_id",
      "position_lat",
      "position_lng",
      "initiative",
      "health",
      "total_health",
      "death_saves",
      "life_saves",
      "statuses",
    ];
  }
  getValues(): any[] {
    return [
      this.history_id,
      this.player_id,
      this.position_lat,
      this.position_lng,
      this.initiative,
      this.health,
      this.totalHealth,
      this.deathSaves,
      this.lifeSaves,
      this.statuses,
    ];
  }
  getIdName(): string {
    return "pmh_id";
  }
  getIdValue() {
    return this.pmh_id;
  }
}

export class PlayerMovementHistoryDB extends DatabaseBase<PlayerMovementHistoryDAO> {
  private static instance: PlayerMovementHistoryDB | undefined = undefined;
  public static getInstance(): PlayerMovementHistoryDB {
    if (PlayerMovementHistoryDB.instance === undefined)
      PlayerMovementHistoryDB.instance = new PlayerMovementHistoryDB();
    return PlayerMovementHistoryDB.instance;
  }
  constructor() {
    super("Player_Movement_History");
  }

  async getPlayerMovementAtHistoryId(history_id: number): Promise<PlayerSaveState[]> {
    const query = `SELECT * FROM public."Player_Movement_History" where history_id = $1;`;
    console.log(query);

    const result: QueryResult<PlayerSaveState> | null = await Database.getInstance()
      .query(query, [history_id])
      .catch((e) => {
        console.error(`Could not ***select*** player movement history (${this.tableName})\n\t${e}`);
        return null;
      });

    const rows: PlayerSaveState[] = result === null ? [] : result.rows;
    return rows.map((val: PlayerSaveState): PlayerSaveState => {
      return {
        player_id: val.player_id,
        position_lat: +val.position_lat,
        position_lng: +val.position_lng,
        health: +val.health,
        total_health: +val.total_health,
        life_saves: +val.life_saves,
        death_saves: +val.death_saves,
        initiative: +val.initiative,
        statuses: val.statuses,
        history_id: val.history_id,
        pmh_id: val.pmh_id,
      };
    });
  }
}
