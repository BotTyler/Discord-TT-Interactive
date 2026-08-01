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

export function RegisterPlayerStateHandler(room: StateHandlerRoom): void {
  room.onMessage("updatePosition", (client: Client, data: any): void => {
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
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.clientToChange);
      if (player === null) return;

      const pos: mLatLng = new mLatLng(+validateParams.pos.lat, +validateParams.pos.lng);
      player.position = pos;
      player.toPosition = [pos];
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("updatePlayerGhostPosition", (client: Client, data: any): void => {
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
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.clientToChange);
      if (player === null) return;

      player.toPosition = validateParams.pos.map((point: mLatLng): mLatLng => {
        return new mLatLng(point.lat, point.lng);
      });
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("changePlayerColor", (client: Client, data: any): void => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "color", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        color: string;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      player.color = validateParams.color;

      player.summons.forEach((summon: Summons): void => {
        summon.color = validateParams.color;
      });
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("changeInitiative", (client: Client, data: any): void => {
    if (!authenticateHostAction(client.sessionId, room)) return;
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
      if (player === null) return;

      player.initiative = validateParams.initiative;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("setPlayerStatuses", (client: Client, data: any): void => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "statuses", type: "array", PostProcess: undefined },
      ];

      const validateParams: {
        statuses: string[];
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      player.statuses = validateParams.statuses.map((status: string): CharacterStatus => {
        return new CharacterStatus(status);
      });
    } catch (error) {
      console.error(error);
    }
  });
}
