import { QueryResult } from "pg";
import {
  DAO,
  DatabaseBase,
} from "../Interface/DatabaseObjectInterface";
import Database from "../Database";

export class AudioCatalogDAO extends DAO {
  public readonly img_catalog_id?: number;
  public readonly player_id: string;
  public readonly audio_name: string;

  constructor(
    player_id: string,
    audio_name: string,
    img_catalog_id?: number,
  ) {
    super();
    this.img_catalog_id = img_catalog_id;
    this.player_id = player_id;
    this.audio_name = audio_name;
  }

  getKeys(): string[] {
    return ["player_id", "audio_name"];
  }
  getValues(): any[] {
    return [this.player_id, this.audio_name];
  }
  getIdName(): string {
    return "audio_catalog_id";
  }
  getIdValue() {
    return this.img_catalog_id;
  }
}

export class AudioCatalogDB extends DatabaseBase<AudioCatalogDAO> {
  private static instance:
    | AudioCatalogDB
    | undefined = undefined;
  public static getInstance(): AudioCatalogDB {
    if (AudioCatalogDB.instance === undefined)
      AudioCatalogDB.instance =
        new AudioCatalogDB();
    return AudioCatalogDB.instance;
  }

  async selectAllAudioByPlayerId(
    player_id: string,
  ) {
    const query = `SELECT * FROM public."Audio_Catalog" where player_id = $1;`;

    const result:
      | QueryResult<AudioCatalogDAO>
      | undefined = await Database.getInstance()
      .query(query, [player_id])
      .catch((e) => {
        console.error(
          `Could not ***select*** (${this.tableName})\n\t${e}`,
        );
        return undefined;
      });
    return result?.rows;
  }

  async selectByAudioName(audioName: string) {
    const query = `SELECT * FROM public."Audio_Catalog" where audio_name = $1;`;

    const result:
      | QueryResult<AudioCatalogDAO>
      | undefined = await Database.getInstance()
      .query(query, [audioName])
      .catch((e) => {
        console.error(
          `Could not ***select*** (${this.tableName})\n\t${e}`,
        );
        return undefined;
      });
    return result?.rows[0];
  }

  async create(
    data: AudioCatalogDAO,
  ): Promise<number | undefined> {
    return await super
      .create(data)
      .then(async (id: number | undefined) => {
        if (id !== undefined) return id;

        // if the id is null I need to query the database to get the original ID
        const query = `SELECT audio_catalog_id as id from public."Audio_Catalog" where audio_name = $1;`;
        console.log(query);

        const result:
          | QueryResult<{ id: number }>
          | undefined =
          await Database.getInstance()
            .query(query, [data.audio_name])
            .catch((e) => {
              console.error(
                `Could not ***select*** (${this.tableName})\n\t${e}`,
              );
              return undefined;
            });

        return result?.rows[0].id;
      });
  }
  constructor() {
    super("Audio_Catalog");
  }
}
