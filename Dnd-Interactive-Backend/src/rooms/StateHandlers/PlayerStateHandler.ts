import { Client } from "colyseus";
import {
  authenticateHostAction,
  softAuthenticate,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { CharacterStatus } from "../../shared/StatusTypes";
import { Summons } from "../../shared/Summons";
import { StateHandlerRoom } from "../StateHandlerRoom";
import { logger } from "../../logger/logger";

export function RegisterPlayerStateHandler(room: StateHandlerRoom): void {
  room.onMessage("updatePosition", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started updatePosition");
    try {
      const inputList: ValidationInputType[] = [
        { name: "pos", type: "object", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];
      const validateParams: {
        pos: mLatLng;
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.clientToChange, room)) {
        logger.warn({ client: client.sessionId }, "Client is not authorized for this action");
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.clientToChange);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player not found in Room");
        return;
      }

      const pos: mLatLng = new mLatLng(+validateParams.pos.lat, +validateParams.pos.lng);
      player.position = pos;
      player.toPosition = [pos];
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("updatePlayerGhostPosition", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started updatePlayerGhostPosition");
    try {
      const inputList: ValidationInputType[] = [
        { name: "pos", type: "array", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];
      const validateParams: {
        pos: mLatLng[];
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      if (!softAuthenticate(client.sessionId, validateParams.clientToChange, room)) {
        logger.warn({ client: client.sessionId }, "Client is not authorized for this action");
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.clientToChange);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player not found in Room");
        return;
      }

      player.toPosition = validateParams.pos.map((point: mLatLng): mLatLng => {
        return new mLatLng(point.lat, point.lng);
      });
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("changePlayerColor", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started changePlayerColor");
    try {
      const inputList: ValidationInputType[] = [
        { name: "color", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        color: string;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player not found in Room");
        return;
      }

      player.color = validateParams.color;

      player.summons.forEach((summon: Summons): void => {
        summon.color = validateParams.color;
      });
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("changeInitiative", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started changeInitiative");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "initiative", type: "number", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        initiative: number;
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerByUserId(validateParams.clientToChange);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player not found in Room");
        return;
      }

      player.initiative = validateParams.initiative;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("setPlayerStatuses", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started setPlayerStatuses");
    try {
      const inputList: ValidationInputType[] = [
        { name: "statuses", type: "array", PostProcess: undefined },
      ];

      const validateParams: {
        statuses: string[];
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player not found in Room");
        return;
      }

      player.statuses = validateParams.statuses.map((status: string): CharacterStatus => {
        return new CharacterStatus(status);
      });
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
}
