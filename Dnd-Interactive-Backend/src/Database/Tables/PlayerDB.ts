import { QueryResult } from "pg";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import Database from "../Database";

export class PlayerDAO extends DAO {
  private id: string;
  private name: string;

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  getKeys(): string[] {
    return [this.getIdName(), "name"];
  }
  getValues(): any[] {
    return [this.getIdValue(), this.name];
  }
  getIdName(): string {
    return "user_id";
  }
  getIdValue() {
    return this.id;
  }
}

export class PlayerDB extends DatabaseBase<PlayerDAO> {
  private static instance: PlayerDB | undefined = undefined;
  public static getInstance(): PlayerDB {
    if (PlayerDB.instance === undefined) PlayerDB.instance = new PlayerDB();
    return PlayerDB.instance;
  }
  async create(data: PlayerDAO): Promise<number | undefined> {
    const keys = data.getKeys();
    const values = data.getValues();
    const placeholders = data.getPlaceHolders();

    const query = `INSERT INTO public."Player" (${keys.join(", ")}) VALUES (${placeholders.join(", ")}) ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name RETURNING ${data.getIdName()} as id;`;
    console.log(query);

    const result: QueryResult<{ id: number }> | undefined = await Database.getInstance()
      .query(query, values)
      .catch((e) => {
        console.error(`Could not ***insert*** (${this.tableName})\n\t${e}`);
        return undefined;
      });

    return result?.rows[0].id;
  }
  constructor() {
    super("Player");
  }
}
