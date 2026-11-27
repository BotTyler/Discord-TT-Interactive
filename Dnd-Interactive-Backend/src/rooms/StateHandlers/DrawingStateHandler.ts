import { Client } from "colyseus";
import { softAuthenticate, ValidateAllInputs, ValidationInputType } from "../../Util/Utils";
import { ArcDrawing, BeamDrawing, CircleDrawing, CubeDrawing } from "../../shared/DrawingInterface";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { StateHandlerRoom } from "../StateHandlerRoom";
import { logger } from "../../logger/logger";

export function RegisterDrawingStateHandler(room: StateHandlerRoom): void {
  room.onMessage("addDrawings", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Adding Drawing");
    try {
      const inputList: ValidationInputType[] = [
        { name: "points", type: "array", PostProcess: undefined },
      ];
      const validateParams: {
        points: mLatLng[];
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player is not found within the Room");
        return;
      }

      player.drawings = validateParams.points.map((val: { lat: number; lng: number }): mLatLng => {
        return new mLatLng(+val.lat, +val.lng);
      });
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
  room.onMessage("removeDrawing", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Removing Drawing");
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) {
        logger.warn({ client: client.sessionId }, "Player not authenticated for this action");
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player is not found within this ROOM");
        return;
      }

      player.drawings = [];
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  // Cube Drawings
  room.onMessage("addCube", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Adding Cube");
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
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player is not found within this room");
        return;
      }

      const center: mLatLng = new mLatLng(+validateParams.center.lat, +validateParams.center.lng);
      const radius: number = validateParams.radius;

      player.cubeDrawing = new CubeDrawing(center, radius);
    } catch (error) {
      logger.error({ err: error }, "Unexpected error");
    }
  });

  room.onMessage("removeCube", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Remove Cube");
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) {
        logger.warn({ client: client.sessionId }, "Client not authenticated for this action");
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player is not found within this Room");
        return;
      }
      player.cubeDrawing = null;
    } catch (error) {
      logger.error({ err: error }, "Unexpected error");
    }
  });

  // Circle Drawings
  room.onMessage("addCircle", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Add Circle");
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
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player not found within Room");
        return;
      }

      const center: mLatLng = new mLatLng(+validateParams.center.lat, +validateParams.center.lng);
      const radius: number = validateParams.radius;

      player.circleDrawing = new CircleDrawing(center, radius);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("removeCircle", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Remove Circle");
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) {
        logger.warn({ client: client.sessionId }, "Client is not authenticated for this action");
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player not found within Room");
        return;
      }

      player.circleDrawing = null;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  // Arc Drawings
  room.onMessage("addArc", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Add Arc");
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
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Client not found within Room");
        return;
      }

      const center: mLatLng = new mLatLng(+validateParams.center.lat, +validateParams.center.lng);
      const toLocation: mLatLng = new mLatLng(
        +validateParams.toLocation.lat,
        +validateParams.toLocation.lng,
      );
      const angle: number = validateParams.angle;

      player.arcDrawing = new ArcDrawing(center, toLocation, angle);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("removeArc", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Remove Arc");
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) {
        logger.warn({ client: client.sessionId }, "Client is not authenticated for this action");
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Client not found within Room");
        return;
      }

      player.arcDrawing = null;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  // Beam Drawings
  room.onMessage("addBeam", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Add Beam");
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
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player is not found within Room");
        return;
      }

      const start: mLatLng = new mLatLng(+validateParams.start.lat, +validateParams.start.lng);
      const end: mLatLng = new mLatLng(+validateParams.end.lat, +validateParams.end.lng);
      const width: number = validateParams.width;

      player.beamDrawing = new BeamDrawing(start, end, width);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("removeBeam", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Remove Beam");
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerId", type: "string", PostProcess: undefined },
      ];

      const validateParams: { playerId: string } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.playerId, room)) {
        logger.warn({ client: client.sessionId }, "Client is not authenticated for this action");
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.playerId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Client is not found within Room");
        return;
      }

      player.beamDrawing = null;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
}
