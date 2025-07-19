import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class ImageCatalogDAO extends DAO {
  public readonly img_catalog_id?: number;
  public readonly player_id: string;
  public readonly image_name: string;
  public readonly width: number;
  public readonly height: number;

  constructor(
    player_id: string,
    image_name: string,
    width: number,
    height: number,
    img_catalog_id?: number,
  ) {
    super();
    this.img_catalog_id = img_catalog_id;
    this.player_id = player_id;
    this.image_name = image_name;
    this.width = width;
    this.height = height;
  }

  getKeys(): string[] {
    return ["player_id", "image_name", "width", "height"];
    // return ["enemy_id", "image", "name"];
  }
  getValues(): any[] {
    return [this.player_id, this.image_name, this.width, this.height];
    // return [this.enemy_id, this.image, this.name];
  }
  getIdName(): string {
    return "img_catalog_id";
  }
  getIdValue() {
    return this.img_catalog_id;
  }
}

export class ImageCatalogDB extends DatabaseBase<ImageCatalogDAO> {
  private static instance: ImageCatalogDB | undefined = undefined;
  public static getInstance(): ImageCatalogDB {
    if (ImageCatalogDB.instance === undefined) ImageCatalogDB.instance = new ImageCatalogDB();
    return ImageCatalogDB.instance;
  }

  async selectAllImagesByPlayerId(player_id: string) {
    const query = `SELECT * FROM public."Image_Catalog" where player_id = $1;`;

    const result: QueryResult<ImageCatalogDAO> | undefined = await Database.getInstance()
      .query(query, [player_id])
      .catch((e) => {
        console.error(`Could not ***select*** (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }

  async selectByImageName(image_name: string) {
    const query = `SELECT * FROM public."Image_Catalog" where image_name = $1;`;

    const result: QueryResult<ImageCatalogDAO> | undefined = await Database.getInstance()
      .query(query, [image_name])
      .catch((e) => {
        console.error(`Could not ***select*** (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows[0];
  }

  async create(data: ImageCatalogDAO): Promise<number | undefined> {
    return await super.create(data).then(async (id: number | undefined) => {
      if (id !== undefined) return id;

      // if the id is null I need to query the database to get the original ID
      const query = `SELECT img_catalog_id as id from public."Image_Catalog" where image_name = $1;`;

      const result: QueryResult<{ id: number }> | undefined = await Database.getInstance()
        .query(query, [data.image_name])
        .catch((e) => {
          console.error(`Could not ***select*** (${this.tableName})\n\t${e}`);
          return undefined;
        });

      return result?.rows[0].id;
    });
  }
  constructor() {
    super("Image_Catalog");
  }
}
