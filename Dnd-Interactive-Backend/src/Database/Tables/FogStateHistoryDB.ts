import { QueryResult } from "pg";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import Database from "../Database";

export class FogStateHistoryDAO extends DAO {
  private id?: number;
  private history_id: number;
  private fog_id: number;
  private visible: boolean;

  constructor(history_id: number, fog_id: number, visible: boolean, id?: number) {
    super();
    this.id = id;
    this.history_id = history_id;
    this.fog_id = fog_id;
    this.visible = visible;
  }

  getKeys(): string[] {
    return ["history_id", "fog_id", "visible"];
  }
  getValues(): any[] {
    return [this.history_id, this.fog_id, this.visible];
  }
  getIdName(): string {
    return "id";
  }
  getIdValue() {
    return this.id;
  }
}

export class FogStateHistoryDB extends DatabaseBase<FogStateHistoryDAO> {
  private static instance: FogStateHistoryDB | undefined = undefined;
  public static getInstance(): FogStateHistoryDB {
    if (FogStateHistoryDB.instance === undefined) FogStateHistoryDB.instance = new FogStateHistoryDB();
    return FogStateHistoryDB.instance;
  }
  constructor() {
    super("Fog_State_History");
  }

  async getFogStateAtHistoryId(history_id: number) {
    const query = `SELECT * FROM public."Fog_State_History" as FSH join public."Fog" as F on FSH.fog_id = F.id where FSH.history_id = $1;`;
    console.log(query);

    const result: QueryResult<FshJoinInterface> | undefined = await Database.getInstance()
      .query(query, [history_id])
      .catch((e) => {
        console.error(`Could not ***select*** Fog State history (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }
}

export interface FshJoinInterface {
  id: number;
  history_id: number;
  fog_id: number;
  visible: boolean;
  polygon: string; // this will definitely need to be changed
}
