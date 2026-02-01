import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import { LoadCampaign, LoadSaveHistory } from "../../shared/LoadDataInterfaces";

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

  async selectByCampaignId(campaign_id: string, player_id: string): Promise<LoadSaveHistory[]> {
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

    return rows.map((val: SaveHistoryDAO): LoadSaveHistory => {
      return {
        id: val.id!,
        map: val.map,
        date: val.date,
        player_id: val.player_id,
        player_size: +val.player_size,
      };
    });
  }

  async selectByCampaignIdWithMap(
    campaign_id: number,
    player_id: string,
    save_history_id: number,
  ): Promise<LoadCampaign[]> {
    const query = `
      SELECT SH.id, SH.player_size, MP."name", IC.width, IC.height, IC.image_name FROM Public."Save_History" SH
        JOIN public."Map" as MP on MP.id = SH.map
        JOIN public."Image_Catalog" as IC on IC.img_catalog_id = MP.image_id
	    WHERE SH.map = $1
        AND SH.player_id = $2
        AND SH.id = $3;`;
    console.log(query);

    const result: QueryResult<LoadCampaign> | null = await Database.getInstance()
      .query(query, [campaign_id, player_id, save_history_id])
      .catch((e) => {
        console.error(
          `Could not ***select**** Campaign Id: ${campaign_id} from (${this.tableName})`,
        );
        return null;
      });
    const rows: LoadCampaign[] = result === null ? [] : result.rows;

    return rows.map((val: LoadCampaign): LoadCampaign => {
      return {
        id: val.id!,
        name: val.name,
        image_name: val.image_name,
        player_size: +val.player_size,
        height: +val.height,
        width: +val.width,
      };
    });
  }
}
