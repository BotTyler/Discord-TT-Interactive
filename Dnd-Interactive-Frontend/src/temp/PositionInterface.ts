import { Schema, type } from "@colyseus/schema";

export class mLatLng extends Schema {
  @type("number")
  lat: number;

  @type("number")
  lng: number;

  constructor(lat: number, lng: number) {
    super();
    this.lat = lat;
    this.lng = lng;
  }
}
