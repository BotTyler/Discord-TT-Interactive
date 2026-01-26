import { QueryResult } from "pg";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import Database from "../Database";

export class EnemyDAO extends DAO {
  public enemy_id?: number;
  public image_id: number;
  public name: string;
  constructor(image_id: number, name: string, enemy_id?: number) {
    super();
    this.enemy_id = enemy_id;
    this.image_id = image_id;
    this.name = name;
  }

  getKeys(): string[] {
    return ["image_id", "name"];
    // return ["enemy_id", "image", "name"];
  }
  getValues(): any[] {
    return [this.image_id, this.name];
    // return [this.enemy_id, this.image, this.name];
  }
  getIdName(): string {
    return "enemy_id";
  }
  getIdValue() {
    return this.enemy_id;
  }
}

export class EnemyDB extends DatabaseBase<EnemyDAO> {
  private static instance: EnemyDB | undefined = undefined;
  public static getInstance(): EnemyDB {
    if (EnemyDB.instance === undefined) EnemyDB.instance = new EnemyDB();
    return EnemyDB.instance;
  }

  async selectById(id: number): Promise<EnemyDAO | null> {
    const query = `SELECT * FROM public."${this.tableName}" where enemy_id = $1;`;
    console.log(query);

    const result: QueryResult<EnemyDAO> | undefined = await Database.getInstance()
      .query(query, [id])
      .catch((e) => {
        console.error(`Could not ***select*** by ID (${this.tableName})\n\t${e}`);
        return undefined;
      });
    const rowResult: EnemyDAO | null = result?.rows[0] ?? null;
    if (rowResult === null) return null;

    const enemy_id: number = +rowResult.enemy_id!;
    const enemy_name: string = rowResult.name;
    const image_id: number = +rowResult.image_id;

    return new EnemyDAO(image_id, enemy_name, enemy_id);
  }

  constructor() {
    super("Enemy");
  }
}
