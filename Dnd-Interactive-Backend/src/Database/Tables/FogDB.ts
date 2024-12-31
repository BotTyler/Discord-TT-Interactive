import { mLatLng } from "dnd-interactive-shared";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class FogDAO extends DAO {
  private id?: number;
  private polygon: mLatLng[];
  constructor(polygon: mLatLng[], id?: number) {
    super();
    this.id = id;
    this.polygon = polygon;
  }

  getKeys(): string[] {
    return ["polygon"];
  }
  getValues(): any[] {
    // TODO: fix the polygon to match the format expected in the database
    const polygonString = `(${this.polygon
      .map((points) => {
        return `(${points.lat},${points.lng})`;
      })
      .join(",")})`;
    return [polygonString];
  }
  getIdName(): string {
    return "id";
  }
  getIdValue() {
    return this.id;
  }
}

export class FogDB extends DatabaseBase<FogDAO> {
  private static instance: FogDB | undefined = undefined;
  public static getInstance(): FogDB {
    if (FogDB.instance === undefined) FogDB.instance = new FogDB();
    return FogDB.instance;
  }
  constructor() {
    super("Fog");
  }
}
