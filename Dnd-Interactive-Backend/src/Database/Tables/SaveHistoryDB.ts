import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class SaveHistoryDAO extends DAO {
  public readonly id?: number;
  public readonly date: Date;
  public readonly map: number;
  public readonly player_id: string;
  public readonly player_size: number;

  constructor(date: Date, map: number, player_id: string, player_size: number, id?: number) {
    super();
    this.id = id;
    this.date = date;
    this.player_id = player_id;
    this.map = map;
    this.player_size = player_size;
  }

  getKeys(): string[] {
    return ["date", "map", "player_id", "player_size"];
  }
  getValues(): any[] {
    return [this.date.toISOString(), this.map, this.player_id, this.player_size];
  }
  getIdName(): string {
    return "id";
  }
  getIdValue() {
    return this.id;
  }
}

export class SaveHistoryDB extends DatabaseBase<SaveHistoryDAO> {
  private static instance: SaveHistoryDB | undefined = undefined;
  public static getInstance(): SaveHistoryDB {
    if (SaveHistoryDB.instance === undefined) SaveHistoryDB.instance = new SaveHistoryDB();
    return SaveHistoryDB.instance;
  }
  constructor() {
    super("Save_History");
  }

  async selectByCampaignId(campaign_id: string, player_id: string): Promise<SaveHistoryDAO[]> {
    const query = `SELECT * FROM Public."Save_History" 
        where map = $1 
          AND player_id = $2
        ORDER BY date DESC
        LIMIT 20;`;
    console.log(query);

    const result: QueryResult<SaveHistoryDAO> | null = await Database.getInstance()
      .query(query, [campaign_id, player_id])
      .catch((e) => {
        console.error(
          `Could not ***select**** Campaign Id: ${campaign_id} from (${this.tableName})`,
        );
        return null;
      });

    const rows: SaveHistoryDAO[] = result === null ? [] : result.rows;
    return rows.map((val: SaveHistoryDAO): SaveHistoryDAO => {
      return new SaveHistoryDAO(val.date, +val.map, val.player_id, +val.player_size, +val.id!);
    });
  }
}
