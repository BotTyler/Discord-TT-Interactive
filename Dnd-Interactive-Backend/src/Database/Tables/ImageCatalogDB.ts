import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";
import { logger } from "../../logger/logger";

export class ImageCatalogDAO extends DAO {
  public readonly img_catalog_id?: number;
  public readonly player_id: string;
  public readonly image_location: string;
  public readonly width: number;
  public readonly height: number;
  public readonly name: string;

  constructor(
    player_id: string,
    image_location: string,
    width: number,
    height: number,
    name: string,
    img_catalog_id?: number,
  ) {
    super();
    this.img_catalog_id = img_catalog_id;
    this.player_id = player_id;
    this.image_location = image_location;
    this.width = width;
    this.height = height;
    this.name = name;
  }

  getKeys(): string[] {
    return ["player_id", "image_location", "width", "height", "name"];
    // return ["enemy_id", "image", "name"];
  }
  getValues(): any[] {
    return [this.player_id, this.image_location, this.width, this.height, this.name];
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

  async selectAllImagesByPlayerId(player_id: string): Promise<ImageCatalogDAO[]> {
    const query = `
        SELECT 
          IC.player_id as player_ID,
          IC.image_location as image_location,
          IC.width as width,
          IC.height as height,
          IC.name as name,
          IC.img_catalog_id as img_catalog_id
        FROM public."Image_Catalog" IC
        where player_id = $1;`;
    logger.debug(query);

    const result: QueryResult<ImageCatalogDAO> | null = await Database.getInstance()
      .query(query, [player_id])
      .catch((e) => {
        logger.error({ table: this.tableName, query: query, err: e }, "Could not ***select***");
        return null;
      });
    const rows: ImageCatalogDAO[] = result === null ? [] : result.rows;
    return rows.map((val: ImageCatalogDAO): ImageCatalogDAO => {
      return new ImageCatalogDAO(
        val.player_id,
        val.image_location,
        +val.width,
        +val.height,
        val.name,
        +val.img_catalog_id!,
      );
    });
  }

  async selectByImageSrc(image_src: string): Promise<ImageCatalogDAO | null> {
    const query = `
        SELECT 
          IC.player_id as player_ID,
          IC.image_location as image_location,
          IC.width as width,
          IC.height as height,
          IC.name as name,
          IC.img_catalog_id as img_catalog_id
        FROM public."Image_Catalog" IC
        where image_location = $1;`;
    logger.debug(query);

    const result: QueryResult<ImageCatalogDAO> | null = await Database.getInstance()
      .query(query, [image_src])
      .catch((e) => {
        logger.error({ table: this.tableName, query: query, err: e }, "Could not ***select***");
        return null;
      });
    const rows: ImageCatalogDAO[] = result === null ? [] : result.rows;
    if (rows.length > 0) {
      const firstRow: ImageCatalogDAO = rows[0];
      return new ImageCatalogDAO(
        firstRow.player_id,
        firstRow.image_location,
        +firstRow.width,
        +firstRow.height,
        firstRow.name,
        +firstRow.img_catalog_id!,
      );
    }
    return null;
  }

  async create(data: ImageCatalogDAO): Promise<number | null> {
    return await super.create(data).then(async (id: number | null): Promise<number | null> => {
      if (id !== null) return id;

      // if the id is null, query the database to get the original ID
      const query = `
        SELECT
          img_catalog_id as id 
        FROM public."Image_Catalog" 
        WHERE image_name = $1;`;
      logger.debug(query);

      const result: QueryResult<{ id: number }> | null = await Database.getInstance()
        .query(query, [data.image_location])
        .catch((e) => {
          logger.error({ table: this.tableName, query: query, err: e }, "Could not ***select***");
          return null;
        });

      const createdResultId: number | null = result === null ? null : +result.rows[0].id;
      return createdResultId;
    });
  }
  constructor() {
    super("Image_Catalog");
  }
}
