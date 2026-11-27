import { Client } from "colyseus";
import { sanitize, ValidateAllInputs, ValidationInputType } from "../../Util/Utils";
import { Player } from "../../shared/Player";
import { StateHandlerRoom } from "../StateHandlerRoom";
import { logger } from "../../logger/logger";

export function RegisterMessageStateHandler(room: StateHandlerRoom): void {
  room.onMessage("BroadcastMessage", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started BroadcastMessage");
    // input validation
    try {
      const checkMessageType = (val: string) => {
        if (val !== "player" && val !== "all" && val !== "host") {
          throw new Error("Message Type is Invalid!!");
        }
        return val;
      };
      const inputList: ValidationInputType[] = [
        { name: "message", PostProcess: sanitize, type: "string" },
        { name: "type", PostProcess: checkMessageType, type: "string" },
      ];
      const validateParams: any = ValidateAllInputs(data, inputList);

      // validation complete lets send the message to all the clients
      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Sending Player does not exist in Room");
        return;
      }

      const sendData = {
        created: new Date(),
        displayName: player.name,
        userId: player.userId,
        message: validateParams.message,
        type: validateParams.type,
      };

      switch (validateParams.type) {
        case "player":
          room.broadcast("PlayerMessageAdd", { message: sendData });
          break;
        case "host":
          room.broadcast("HostMessageAdd", { message: sendData });
          break;
        case "all":
          room.broadcast("AllMessageAdd", { message: sendData });
          break;
      }
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("BroadcastHandout", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started BroadcastHandout");
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerIds", PostProcess: undefined, type: "array" },
        { name: "imageUrl", PostProcess: undefined, type: "string" },
      ];
      const validateParams: any = ValidateAllInputs(data, inputList);

      validateParams.playerIds.forEach((x: string): void => {
        // we need to grab the player
        const player: Player | null = room.state.getPlayerByUserId(x);
        if (player === null) {
          logger.warn({ player: x }, "Player not found for Broadcast");
          return;
        }
        const client = room.clients.getById(player.sessionId);
        if (!client) {
          logger.warn({ playerClient: client }, "Player client not found for Broadcast");
          return;
        }

        // client is ready to receive request
        client.send("HandoutAdd", { id: crypto.randomUUID(), imageUrl: validateParams.imageUrl });
      });
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
}
