import { QueryResult } from "pg";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import Database from "../Database";

export class SummonsDao extends DAO {
  public summons_id?: number;
  public player_id: string;
  public image_id: number;
  public name: string;
  constructor(image_id: number, name: string, player_id: string, summons_id?: number) {
    super();
    this.summons_id = summons_id;
    this.player_id = player_id;
    this.image_id = image_id;
    this.name = name;
  }

  getKeys(): string[] {
    return ["image_id", "player_id", "name"];
    // return ["enemy_id", "image", "name"];
  }
  getValues(): any[] {
    return [this.image_id, this.player_id, this.name];
    // return [this.enemy_id, this.image, this.name];
  }
  getIdName(): string {
    return "summons_id";
  }
  getIdValue() {
    return this.summons_id;
  }
}

export class SummonsDB extends DatabaseBase<SummonsDao> {
  private static instance: SummonsDB | undefined = undefined;
  public static getInstance(): SummonsDB {
    if (SummonsDB.instance === undefined) SummonsDB.instance = new SummonsDB();
    return SummonsDB.instance;
  }

  async selectById(id: any): Promise<SummonsDao | null> {
    const query = `SELECT * FROM public."${this.tableName}" where summons_id = $1;`;
    console.log(query);

    const result: QueryResult<SummonsDao> | undefined = await Database.getInstance()
      .query(query, [id])
      .catch((e) => {
        console.error(`Could not ***select*** by ID (${this.tableName})\n\t${e}`);
        return undefined;
      });
    const rowResult: SummonsDao | null = result?.rows[0] ?? null;
    if (rowResult === null) return null;

    return new SummonsDao(
      +rowResult.image_id,
      rowResult.name,
      rowResult.player_id,
      +rowResult.summons_id!,
    );
  }

  constructor() {
    super("Summons");
  }
}
