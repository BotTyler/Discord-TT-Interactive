import { Room } from "colyseus";
import { softAuthenticate, ValidateAllInputs, ValidationInputType } from "../../Util/Utils";
import { State } from "../../shared/State";
import { mLatLng } from "../../shared/PositionInterface";
import { Player } from "../../shared/Player";
import { ArcDrawing, BeamDrawing, CircleDrawing, CubeDrawing } from "../../shared/DrawingInterface";

export function RegisterDrawingStateHandler(room: Room<State>): void {
  room.onMessage("addDrawings", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "points", type: "array", PostProcess: undefined },
      ];
      const validateParams: {
        points: mLatLng[];
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return false;
      player.drawings = validateParams.points.map((val: { lat: number; lng: number }): mLatLng => {
        return new mLatLng(+val.lat, +val.lng);
      });
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("removeDrawing", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) return;

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) return;

      player.drawings = [];
    } catch (error) {
      console.error(error);
    }
  });

  // Cube Drawings
  room.onMessage("addCube", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "center", type: "object", PostProcess: undefined },
        { name: "radius", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        center: mLatLng;
        radius: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      const center: mLatLng = new mLatLng(+validateParams.center.lat, +validateParams.center.lng);
      const radius: number = validateParams.radius;

      player.cubeDrawing = new CubeDrawing(center, radius);
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("removeCube", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) return;

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) return;
      player.cubeDrawing = null;
    } catch (error) {
      console.error(error);
    }
  });

  // Circle Drawings
  room.onMessage("addCircle", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "center", type: "object", PostProcess: undefined },
        { name: "radius", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        center: mLatLng;
        radius: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      const center: mLatLng = new mLatLng(+validateParams.center.lat, +validateParams.center.lng);
      const radius: number = validateParams.radius;

      player.circleDrawing = new CircleDrawing(center, radius);
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("removeCircle", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) return;

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) return;

      player.circleDrawing = null;
    } catch (error) {
      console.error(error);
    }
  });

  // Arc Drawings
  room.onMessage("addArc", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "center", type: "object", PostProcess: undefined },
        { name: "toLocation", type: "object", PostProcess: undefined },
        { name: "angle", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        center: mLatLng;
        toLocation: mLatLng;
        angle: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      const center: mLatLng = new mLatLng(+validateParams.center.lng, +validateParams.center.lat);
      const toLocation: mLatLng = new mLatLng(
        +validateParams.toLocation.lat,
        +validateParams.toLocation.lng,
      );
      const angle: number = validateParams.angle;

      player.arcDrawing = new ArcDrawing(center, toLocation, angle);
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("removeArc", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) return;

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) return;

      player.arcDrawing = null;
    } catch (error) {
      console.error(error);
    }
  });

  // Beam Drawings
  room.onMessage("addBeam", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "start", type: "object", PostProcess: undefined },
        { name: "end", type: "object", PostProcess: undefined },
        { name: "width", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        start: mLatLng;
        end: mLatLng;
        width: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      const start: mLatLng = new mLatLng(+validateParams.start.lat, +validateParams.start.lng);
      const end: mLatLng = new mLatLng(+validateParams.end.lat, +validateParams.end.lng);
      const width: number = validateParams.width;

      player.beamDrawing = new BeamDrawing(start, end, width);
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("removeBeam", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) return;

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) return;

      player.beamDrawing = null;
    } catch (error) {
      console.error(error);
    }
  });
}
