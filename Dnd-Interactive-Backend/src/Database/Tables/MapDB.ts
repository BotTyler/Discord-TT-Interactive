import { LoadCampaign } from "../../shared/LoadDataInterfaces";
import { QueryResult } from "pg";
import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class MapDAO extends DAO {
  public readonly id?: number;
  public readonly image_id: number; // reference to image catalog
  public readonly icon_height: number;
  public readonly name: string;
  public readonly player_id: string;

  constructor(image_id: number, icon_height: number, name: string, player_id: string, id?: number) {
    super();
    this.id = id;
    this.image_id = image_id;
    this.icon_height = icon_height;
    this.name = name;
    this.player_id = player_id;
  }

  getKeys(): string[] {
    return ["image_id", "icon_height", "name", "player_id"];
    // return ["id", "map_image", "width", "height", "icon_height"];
  }
  getValues(): any[] {
    return [this.image_id, this.icon_height, this.name, this.player_id];
    // return [this.id, this.map_image, this.width, this.height, this.icon_height];
  }
  getIdName(): string {
    return "id";
  }
  getIdValue() {
    return this.id;
  }
}

export class MapDB extends DatabaseBase<MapDAO> {
  private static instance: MapDB | undefined = undefined;
  public static getInstance(): MapDB {
    if (MapDB.instance === undefined) MapDB.instance = new MapDB();
    return MapDB.instance;
  }
  constructor() {
    super("Map");
  }

  async selectMapById(id: number) {
    const query = `SELECT * FROM public."Map" as mm JOIN public."Image_Catalog" as IC on IC.img_catalog_id = mm.image_id where id = $1 ORDER BY id DESC;`;
    console.log(query);

    const result: QueryResult<MapJoinInterface> | undefined = await Database.getInstance()
      .query(query, [id])
      .catch((e) => {
        console.error(`Could not ***select*** Fog State history (${this.tableName})\n\t${e}`);
        return undefined;
      });
    return result?.rows;
  }

  async selectMapByUserId(userId: string) {
    const query = `SELECT MP.id, IC.image_name, IC.height, IC.width, MP."name" FROM Public."Map" AS MP JOIN Public."Image_Catalog" AS IC on IC.img_catalog_id = MP.image_id where MP.player_id = $1;`;
    const result: QueryResult<LoadCampaign> | undefined = await Database.getInstance()
      .query(query, [userId])
      .catch((e) => {
        console.error(`Could not gather map data from the user`);
        return undefined;
      });

    return result?.rows;
  }
}

export interface MapJoinInterface {
  id: number;
  width: number;
  height: number;
  icon_height: number;
  player_id: string;
  image_name: string;
  name: string;
}
