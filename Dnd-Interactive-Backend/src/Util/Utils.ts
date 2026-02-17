import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { MARKER_SIZE_CATEGORIES } from "../shared/MarkerOptions";
import { Client, Room } from "colyseus";
import { State } from "../shared/State";
import { Player } from "../shared/Player";
import { ExportDataInterface } from "../shared/ExportDataInterface";
import { SaveHistoryDAO, SaveHistoryDB } from "../Database/Tables/SaveHistoryDB";
import { CharacterStatus } from "../shared/StatusTypes";
import {
  PlayerMovementHistoryDAO,
  PlayerMovementHistoryDB,
} from "../Database/Tables/PlayerMovementHistoryDB";
import { Summons } from "../shared/Summons";
import { mLatLng } from "../shared/PositionInterface";
import { SummonsHistoryDao, SummonsHistoryDB } from "../Database/Tables/SummonsHistoryDB";
import { Enemy } from "../shared/Enemy";
import {
  EnemyMovementHistoryDAO,
  EnemyMovementHistoryDB,
} from "../Database/Tables/EnemyMovementHistoryDB";
import { InitiativeHistoryDAO, InitiativeHistoryDB } from "../Database/Tables/InitiativeHistoryDB";

export const jsdomWindow = new JSDOM("").window;
export const purify = DOMPurify(jsdomWindow);

export function sanitize(message: string): string {
  /*
  var entityMap: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  const reg = /[&<>"'`=\/]/g;
  return message.replace(reg, (match) => entityMap[match]);
  */
  return purify.sanitize(message);
}
/**
 * Expected type for the validation input method.
 * The type parameter has an optional type NOVERIFY, which will bypass the type check and only make sure the value is present.
 * Some of the more complicated types are "object", "array", these will need to be handled separately.
 */
export type ExpectedTypes =
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "object"
  | "array"
  | "NOVERIFY";
export type ValidationInputType = {
  name: string;
  type: ExpectedTypes;
  PostProcess: ((val: any) => any) | undefined;
};
/**
 *
 * @param reqInputs The inputs provided by the initial request.
 * @param validInputs The list of inputs that should be included. This object will include the following:
 * - name - The name of the request param.
 * - type - The type of the specific param.
 * - SanitizeFunction - (OPTIONAL) If provided, this will sanitize any inputs.
 *
 * @returns If passed validation, a record of values will be returned that are sanitized, otherwise a runtime error is thrown.
 */
export function ValidateAllInputs(
  reqInputs: Record<string, any>,
  validInputs: ValidationInputType[],
): any {
  // console.log(reqInputs);
  try {
    const validatedRecord: Record<string, any> = {};
    for (const field of validInputs) {
      const reqValue = reqInputs[field.name];

      // Check to make sure the value is there and of the right type
      if (reqValue == null) {
        console.error(`Value ${field.name} was found to be undefined!!`);
        throw new Error(`Value ${field.name} was found to be undefined!!`);
      }

      if (!ValidateTypes(reqValue, field.type)) {
        console.error(
          `Value is not of the right type. Value: ${reqValue} Type: ${typeof reqValue} Expected: ${field.type}`,
        );
        throw new Error(
          `Value is not of the right type. Value: ${reqValue} Type: ${typeof reqValue} Expected: ${field.type}`,
        );
      }
      // The value should be here, lets add it to the final record and santize the input if supported.
      if (field.PostProcess) validatedRecord[field.name] = field.PostProcess(reqValue);
      else validatedRecord[field.name] = reqValue;
    }
    return validatedRecord;
  } catch (ex: any) {
    throw new Error("Internal Service Exception", ex);
  }
}

/**
 * @param val - value of type to be checked.
 * @param expected - The expected type provided by the ExpectedTypes Type.
 * @returns - A boolean determining if the type was checked.
 */
function ValidateTypes(val: any, expected: ExpectedTypes): boolean {
  // use a switch to handle the more complicated types.
  // All the other primitive types will be handled by the default case.
  switch (expected) {
    case "array":
      return Array.isArray(val);
      break;
    case "NOVERIFY":
      // For this we do not care to validate the types. This should be treated as dangerous.
      return true;
      break;
    default:
      return typeof val === expected;
  }
}

export function processMarkerStringSizes(value: string): MARKER_SIZE_CATEGORIES {
  switch (value) {
    case "TINY":
      return "TINY";
    case "SMALL":
      return "SMALL";
    case "MEDIUM":
      return "MEDIUM";
    case "LARGE":
      return "LARGE";
    case "HUGE":
      return "HUGE";
    case "GARGANTUAN":
      return "GARGANTUAN";
    default:
      return "MEDIUM";
  }
}

//#region Validation
/**
 * This function will determine if the action taking place is allowed.
 * @param issuer - the player that is calling for a change
 * @param reciever - the player that is recieving the change
 * @returns Boolean to determine if the action is validated
 */
export function softAuthenticate(
  issuer_session_id: string,
  reciever_id: string,
  room: Room<State>,
): boolean {
  const issuer: Player | null = room.state.getPlayerBySessionId(issuer_session_id);
  const reciever: Player | null = room.state.getPlayerByUserId(reciever_id);
  if (issuer === null) return false;
  if (reciever === null) return false;

  return authenticateHostAction(issuer_session_id, room) || issuer.userId === reciever.userId;
}

export function authenticateHostAction(session_id: string, room: Room<State>): boolean {
  // console.log("start authentication")
  const user: Player | null = room.state.getPlayerBySessionId(session_id);
  if (user === null) return false;

  return (
    room.state.currentHostUserId !== undefined &&
    user.isHost &&
    room.state.currentHostUserId === user.userId
  );
}

// Save the current state
// if a client is provided, they will be sent the status of the save.
export function saveState(room: Room<State>, client?: Client): void {
  const data: ExportDataInterface | null = room.state.exportCurrentMapData() ?? null;

  if (data === null) {
    console.log("data not saved!!");
    // client.send("exportData", new Error("Data was not saved!!"));
    return;
  }
  // const player_id = this.state._getPlayerBySessionId(client.sessionId);
  // if (player_id === undefined) return; // this data cannot be inserted into the table
  const host_id: string | undefined = room.state.currentHostUserId;
  if (host_id === undefined) {
    console.log("Host not defined");
    return;
  }

  // TODO: This should be transformed into a transaction on the database side for now this is ok for test purposes.
  SaveHistoryDB.getInstance()
    .create(new SaveHistoryDAO(new Date(), data.map.id!, host_id, data.map.iconHeight))
    .then((history_id: number | null) => {
      if (history_id === null) return;

      const savePromises: Promise<any>[] = [];
      //we have the save history index we now need to insert into all other databases

      // Create a checkpoint for all players in the player_movement_history DB
      [...data.players.keys()].forEach((key) => {
        const p: Player = data.players.get(key)!;
        const position = p.position;
        const initiative = p.initiative;
        const health = p.health;
        const totalHealth = p.totalHealth;
        const deathSaves = p.deathSaves;
        const lifeSaves = p.lifeSaves;
        const statuses: string[] = p.statuses.map((val: CharacterStatus): string => {
          return val.toString();
        });

        const playerSavePromise: Promise<any> = PlayerMovementHistoryDB.getInstance().create(
          new PlayerMovementHistoryDAO(
            history_id,
            key,
            position,
            initiative,
            health,
            totalHealth,
            deathSaves,
            lifeSaves,
            statuses,
          ),
        );
        savePromises.push(playerSavePromise);

        p.summons.forEach((curSummon: Summons): void => {
          const summons_id: number = curSummon.id;
          const size_category: MARKER_SIZE_CATEGORIES = curSummon.size_category;
          const position: mLatLng = curSummon.position;
          const health: number = curSummon.health;
          const totalHealth: number = curSummon.totalHealth;
          const deathSaves: number = curSummon.deathSaves;
          const lifeSaves: number = curSummon.lifeSaves;
          const isVisible: boolean = curSummon.isVisible;
          const statuses: string[] = curSummon.statuses.map((val: CharacterStatus): string => {
            return val.toString();
          });

          const summonSavePromise: Promise<any> = SummonsHistoryDB.getInstance().create(
            new SummonsHistoryDao(
              history_id,
              summons_id,
              p.userId,
              size_category,
              position,
              health,
              totalHealth,
              deathSaves,
              lifeSaves,
              isVisible,
              statuses,
            ),
          );

          savePromises.push(summonSavePromise);
        });
      });

      // Create a checkpoint for all enemies
      [...data.enemies.keys()].forEach((key: string): void => {
        const e: Enemy = data.enemies.get(key)!;

        const enemy_id: number = e.id;
        const position: mLatLng = e.position;
        const size_category: MARKER_SIZE_CATEGORIES = e.size_category;
        const initiaitive: number = e.initiative;
        const health: number = e.health;
        const totalHealth: number = e.totalHealth;
        const deathSaves: number = e.deathSaves;
        const lifeSaves: number = e.lifeSaves;
        const isVisible: boolean = e.isVisible;
        const statuses: string[] = e.statuses.map((val: CharacterStatus): string => {
          return val.toString();
        });

        const enemySavePromise: Promise<any> = EnemyMovementHistoryDB.getInstance().create(
          new EnemyMovementHistoryDAO(
            history_id,
            enemy_id,
            size_category,
            position,
            initiaitive,
            health,
            totalHealth,
            deathSaves,
            lifeSaves,
            isVisible,
            statuses,
          ),
        );

        savePromises.push(enemySavePromise);
      });

      const initiativeSavePromise: Promise<any> = InitiativeHistoryDB.getInstance().create(
        new InitiativeHistoryDAO(history_id, data.map.initiativeIndex),
      );
      savePromises.push(initiativeSavePromise);

      if (client !== undefined) {
        Promise.allSettled(savePromises)
          .then((value: PromiseSettledResult<any>[]): void => {
            let errorAmount: number = 0;
            value.forEach((promiseReturn: PromiseSettledResult<any>): void => {
              if (promiseReturn.status === "rejected") {
                errorAmount++;
              }
            });
            /**
              0 = SUCCESS
              1 = WARNING - Partial Save
              2 = ERROR - NO SAVE
              */
            const sendRes: { level: number } = { level: 0 };
            if (errorAmount === 0) {
              sendRes.level = 0;
            } else if (errorAmount < value.length) {
              sendRes.level = 1;
            } else {
              sendRes.level = 2;
            }

            client.send("SaveStatus", sendRes);
          })
          .catch((_e: any): void => {
            // This should never happen.
            console.error("Error in promise.settled of save function");
          });
      }
    })
    .catch((_e: any): void => {
      if (client !== undefined) {
        // Send back a compelte failure
        client.send("SaveStatus", { level: 2 });
      }
    });
}
