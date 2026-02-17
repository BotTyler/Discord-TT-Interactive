import { Room } from "colyseus";
import {
  authenticateHostAction,
  sanitize,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";
import { Player } from "../../shared/Player";
import { MapMovementType, State } from "../../shared/State";

export function RegisterGameStateHandler(room: Room<State>): void {
  room.onMessage("ChangeGridColor", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
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
      console.error(error);
    }
  });

  room.onMessage("GridDisplay", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "gridShowing", PostProcess: undefined, type: "boolean" },
      ];
      const validateParams: {
        gridShowing: boolean;
      } = ValidateAllInputs(data, inputList);

      room.state.gridShowing = validateParams.gridShowing;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("setHost", (client, _data) => {
    if (room.state.currentHostUserId !== undefined) return;

    const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
    if (player === null) return;

    player.isHost = true;
    room.state.currentHostUserId = player.userId;
    room.state.RESET_GAME();
  });

  room.onMessage("removeHost", (client, _data) => {
    if (room.state.currentHostUserId === undefined) return;

    const player: Player | null = room.state.getPlayerByUserId(room.state.currentHostUserId);
    if (player === null) return;
    player.isHost = false;
    room.state.currentHostUserId = undefined;
  });

  // GAME STATES
  room.onMessage("setGameState", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "gameState", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        gameState: number;
      } = ValidateAllInputs(data, inputList);

      room.state.gameState = validateParams.gameState;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("SetMapMovementType", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
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
      console.error(error);
    }
  });
}
