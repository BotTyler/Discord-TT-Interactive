import { Schema, type } from "@colyseus/schema";
import { mLatLng } from "./PositionInterface";

export class CubeDrawing extends Schema {
  @type(mLatLng)
  center: mLatLng;

  @type("number")
  radius: number;

  constructor(center: mLatLng, radius: number) {
    super();
    this.center = center;
    this.radius = radius;
  }
}

export class CircleDrawing extends Schema {
  @type(mLatLng)
  center: mLatLng;

  @type("number")
  radius: number;

  constructor(center: mLatLng, radius: number) {
    super();
    this.center = center;
    this.radius = radius;
  }
}

export class ArcDrawing extends Schema {
  @type(mLatLng)
  center: mLatLng;

  @type(mLatLng)
  toLocation: mLatLng;

  @type("number")
  angle: number;

  constructor(center: mLatLng, toLocation: mLatLng, angle: number) {
    super();
    this.center = center;
    this.toLocation = toLocation;
    this.angle = angle;
  }
}
