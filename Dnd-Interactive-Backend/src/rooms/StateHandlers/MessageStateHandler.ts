import { Room } from "colyseus";
import { sanitize, ValidateAllInputs, ValidationInputType } from "../../Util/Utils";
import { Player } from "../../shared/Player";
import { State } from "../../shared/State";

export function RegisterMessageStateHandler(room: Room<State>): void {
  room.onMessage("BroadcastMessage", (client, data) => {
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
      if (player === null) return;

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
      console.error(error);
    }
  });

  room.onMessage("BroadcastHandout", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "playerIds", PostProcess: undefined, type: "array" },
        { name: "imageUrl", PostProcess: undefined, type: "string" },
      ];
      const validateParams: any = ValidateAllInputs(data, inputList);

      validateParams.playerIds.forEach((x: string) => {
        // we need to grab the player
        const player: Player | null = room.state.getPlayerByUserId(x);
        if (player === null) {
          console.error("Player not found");
          return;
        }
        const client = room.clients.getById(player.sessionId);
        if (!client) {
          console.error("Client Not Found");
          return;
        }

        console.log("BroadCasting Handout");
        // client is ready to receive request
        client.send("HandoutAdd", { id: crypto.randomUUID(), imageUrl: validateParams.imageUrl });
      });
    } catch (error) {
      console.error(error);
    }
  });
}
