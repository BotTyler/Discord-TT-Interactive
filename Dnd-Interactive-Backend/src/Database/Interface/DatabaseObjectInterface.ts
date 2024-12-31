import { QueryResult } from "pg";
import Database from "../Database";

const ALLOWED_TABLES = new Set(["Enemy", "Enemy_Movement_History", "Fog", "Fog_State_History", "Image", "Map", "Player", "Player_Movement_History", "Save_History", "Initiative_History", "Image_Catalog", "Audio_Catalog"]);
export abstract class DatabaseBase<T extends DAO> {
  protected tableName: string;
  constructor(tableName: string) {
    if (!ALLOWED_TABLES.has(tableName)) throw new Error("Invalid Table Name");
    this.tableName = tableName;
  }

  async create(data: T): Promise<number | undefined> {
    const keys = data.getKeys();
    const values = data.getValues();
    const placeholders = data.getPlaceHolders();

    const query = `INSERT INTO public."${this.tableName}" (${keys.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING ${data.getIdName()} as id`;
    console.log(query);

    const result: QueryResult<{ id: number }> | undefined = await Database.getInstance()
      .query(query, values)
      .catch((e) => {
        console.error(`Could not ***insert*** (${this.tableName})\n\t${e}`);
        return undefined;
      });

    return result?.rows[0].id;
  }

  async delete(id: number): Promise<void> {
    const query = `DELETE FROM public."${this.tableName}" WHERE id = $1`;
    console.log(query);

    await Database.getInstance()
      .query(query, [id])
      .catch((e) => {
        console.error(`Could not ***delete*** (${this.tableName})\n\t${e}`);
        return undefined;
      });
  }

  async update(data: T): Promise<void> {
    const keys = data.getKeys();
    const values = data.getValues();
    const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

    const query = `UPDATE public."${this.tableName}" SET ${setString} WHERE ${data.getIdName()} = $${keys.length + 1}`;
    console.log(query);
    await Database.getInstance()
      .query(query, [...values, data.getIdValue()])
      .catch((e) => {
        console.error(`Could not ***update*** (${this.tableName})\n\t${e}`);
      });
  }

  async selectAll(): Promise<T[] | undefined> {
    const query = `SELECT * FROM public."${this.tableName}";`;
    console.log(query);

    const result: QueryResult<T> | undefined = await Database.getInstance()
      .query(query)
      .catch((e) => {
        console.error(`Could not ***select*** (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }
}

export abstract class DAO {
  abstract getKeys(): string[];
  abstract getValues(): any[];
  abstract getIdName(): string;
  abstract getIdValue(): any;
  getPlaceHolders(): string[] {
    return this.getKeys().map((_, i) => {
      return `$${i + 1}`;
    });
  }
}
