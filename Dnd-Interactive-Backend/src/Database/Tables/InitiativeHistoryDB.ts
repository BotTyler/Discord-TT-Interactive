import { QueryResult } from "pg";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import Database from "../Database";

export class InitiativeHistoryDAO extends DAO {
  public readonly id?: number;
  public readonly history_id: number;
  public readonly initiative_index: number;

  constructor(history_id: number, initiative_index: number, id?: number) {
    super();
    this.id = id;
    this.initiative_index = initiative_index;
    this.history_id = history_id;
  }

  getKeys(): string[] {
    return ["initiative_index", "history_id"];
  }
  getValues(): any[] {
    return [this.initiative_index, this.history_id];
  }
  getIdName(): string {
    return "id";
  }
  getIdValue() {
    return this.id;
  }
}

export class InitiativeHistoryDB extends DatabaseBase<InitiativeHistoryDAO> {
  private static instance: InitiativeHistoryDB | undefined = undefined;
  public static getInstance(): InitiativeHistoryDB {
    if (InitiativeHistoryDB.instance === undefined) InitiativeHistoryDB.instance = new InitiativeHistoryDB();
    return InitiativeHistoryDB.instance;
  }
  constructor() {
    super("Initiative_History");
  }

  async selectByHistoryId(history_id: number): Promise<InitiativeHistoryDAO[] | undefined> {
    const query = `SELECT * FROM public."Initiative_History" where history_id = $1;`;
    console.log(query);

    const result: QueryResult<InitiativeHistoryDAO> | undefined = await Database.getInstance()
      .query(query, [history_id])
      .catch((e) => {
        console.error(`Could not ***select*** (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }
}
