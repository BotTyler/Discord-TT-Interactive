import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class SaveHistoryDAO extends DAO {
  public readonly id?: number;
  public readonly date: Date;
  public readonly map: number;
  public readonly player_id: string;

  constructor(date: Date, map: number, player_id: string, id?: number) {
    super();
    this.id = id;
    this.date = date;
    this.player_id = player_id;
    this.map = map;
  }

  getKeys(): string[] {
    return ["date", "map", "player_id"];
  }
  getValues(): any[] {
    return [this.date.toISOString(), this.map, this.player_id];
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

  async selectById(player_id: string): Promise<SaveHistoryDAO[] | undefined> {
    const query = `SELECT * FROM public."Save_History" where player_id = $1;`;
    console.log(query);

    const result: QueryResult<SaveHistoryDAO> | undefined = await Database.getInstance()
      .query(query, [player_id])
      .catch((e) => {
        console.error(`Could not ***select*** (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }

  async selectByCampaignId(campaign_id: string): Promise<SaveHistoryDAO[] | undefined> {
    const query = `SELECT * FROM Public."Save_History" where map = $1 ORDER BY date DESC;`;
    console.log(query, campaign_id);

    const result: QueryResult<SaveHistoryDAO> | undefined = await Database.getInstance()
      .query(query, [campaign_id])
      .catch((e) => {
        console.error(
          `Could not ***select**** Campaign Id: ${campaign_id} from (${this.tableName})`,
        );
        return undefined;
      });

    return result?.rows;
  }
}
