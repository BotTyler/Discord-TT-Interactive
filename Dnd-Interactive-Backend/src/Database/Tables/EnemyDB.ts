import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class EnemyDAO extends DAO {
  private enemy_id?: number;
  private image_id: number;
  private name: string;
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
  constructor() {
    super("Enemy");
  }
}
