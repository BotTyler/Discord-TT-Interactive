import { Client } from "colyseus";
import {
  authenticateHostAction,
  sanitize,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";
import { Player } from "../../shared/Player";
import { MapMovementType } from "../../shared/State";
import { StateHandlerRoom } from "../StateHandlerRoom";
import { logger } from "../../logger/logger";

export function RegisterGameStateHandler(room: StateHandlerRoom): void {
  room.onMessage("ChangeGridColor", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started ChangeGridColor");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "gridColor", PostProcess: sanitize, type: "string" },
      ];
      const validateParams: {
        gridColor: string;
      } = ValidateAllInputs(data, inputList);

      // validation complete lets send the message to all the clients
      room.state.gridColor = validateParams.gridColor;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("GridDisplay", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started GridDisplay");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "gridShowing", PostProcess: undefined, type: "boolean" },
      ];
      const validateParams: {
        gridShowing: boolean;
      } = ValidateAllInputs(data, inputList);

      room.state.gridShowing = validateParams.gridShowing;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("setHost", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started setHost");
    if (room.state.currentHostUserId !== undefined) {
      logger.warn(
        { client: client.sessionId, currentHost: room.state.currentHostUserId },
        "Host is already set",
      );
      return;
    }

    const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
    if (player === null) {
      logger.warn({ client: client.sessionId }, "Player cannot be found in the Room");
      return;
    }

    player.isHost = true;
    room.state.currentHostUserId = player.userId;
    logger.info("Resetting Game");
    room.state.RESET_GAME();
  });

  room.onMessage("removeHost", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started removeHost");
    if (room.state.currentHostUserId === undefined) return;

    const player: Player | null = room.state.getPlayerByUserId(room.state.currentHostUserId);
    if (player === null) {
      logger.warn({ client: client.sessionId }, "Player cannot be found in the Room");
      return;
    }
    player.isHost = false;
    room.state.currentHostUserId = undefined;
  });

  // GAME STATES
  room.onMessage("setGameState", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started setGameState");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "gameState", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        gameState: number;
      } = ValidateAllInputs(data, inputList);

      room.state.gameState = validateParams.gameState;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("SetMapMovementType", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started SetMapMovementType");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        {
          name: "mapMovement",
          type: "string",
          PostProcess: (val: string): MapMovementType => {
            switch (val) {
              case "free":
                return "free";
              case "grid":
                return "grid";
              default:
                return "free";
            }
          },
        },
      ];
      const validateParams: {
        mapMovement: MapMovementType;
      } = ValidateAllInputs(data, inputList);

      room.state.mapMovement = validateParams.mapMovement;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
}
