import { Room } from "colyseus";
import { ImageCatalogDAO, ImageCatalogDB } from "../../Database/Tables/ImageCatalogDB";
import { SummonsDao, SummonsDB } from "../../Database/Tables/SummonsDb";
import { MARKER_SIZE_CATEGORIES } from "../../shared/MarkerOptions";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { State } from "../../shared/State";
import { CharacterStatus } from "../../shared/StatusTypes";
import { Summons } from "../../shared/Summons";
import {
  authenticateHostAction,
  processMarkerStringSizes,
  softAuthenticate,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";

export function RegisterSummonsStateHandler(room: Room<State>): void {
  room.onMessage("updateSummonsPosition", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "pos", type: "object", PostProcess: undefined },
        { name: "id", type: "number", PostProcess: undefined },
        { name: "player_id", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        pos: mLatLng;
        id: number;
        player_id: string;
      } = ValidateAllInputs(data, inputList);
      if (!softAuthenticate(client.sessionId, validateParams.player_id, room)) {
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.player_id);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      const position = new mLatLng(+validateParams.pos.lat, +validateParams.pos.lng);
      summon.position = position;
      summon.toPosition = [position];
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("updateSummonsGhostPosition", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "pos", type: "array", PostProcess: undefined },
        { name: "id", type: "number", PostProcess: undefined },
        { name: "player_id", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        pos: mLatLng[];
        id: number;
        player_id: string;
      } = ValidateAllInputs(data, inputList);
      if (!softAuthenticate(client.sessionId, validateParams.player_id, room)) {
        return;
      }

      const player: Player | null = room.state.getPlayerByUserId(validateParams.player_id);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.toPosition = validateParams.pos.map(
        (point: mLatLng): mLatLng => new mLatLng(point.lat, point.lng),
      );
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("addSummons", async (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "avatarUri", type: "string", PostProcess: undefined },
        { name: "name", type: "string", PostProcess: undefined },
        { name: "position", type: "object", PostProcess: undefined },
        { name: "size", type: "string", PostProcess: processMarkerStringSizes },
      ];
      const validateParams: {
        avatarUri: string;
        name: string;
        position: mLatLng;
        size: string;
      } = ValidateAllInputs(data, inputList);

      // NOTE: utilizes the player so no authentication is required.
      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
      const imageCatalog: ImageCatalogDAO | null =
        await ImageCatalogDB.getInstance().selectByImageName(validateParams.avatarUri);
      if (imageCatalog === null) return;
      const summonId: number | null = await SummonsDB.getInstance().create(
        new SummonsDao(imageCatalog.img_catalog_id!, validateParams.name, player.userId),
      );
      if (summonId === null) return;

      const insertSummon: Summons = new Summons({
        player_id: player.userId,
        id: summonId,
        avatarUri: validateParams.avatarUri,
        name: validateParams.name,
        size_category: data.size_category,
        color: player.color,
      });

      insertSummon.position = new mLatLng(validateParams.position.lat, validateParams.position.lng);

      player.summons = [...player.summons, insertSummon];
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("deleteSummons", (client, data) => {
    try {
      // Player_id as room.action can be called on by different people. (host vs player)
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
      } = ValidateAllInputs(data, inputList);

      // NOTE: No authentication is required as the sessionId is being used.

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      player.summons = player.summons.filter(
        (summon: Summons): boolean => summon.id !== validateParams.id,
      );
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("updateSummons", async (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
        { name: "name", type: "string", PostProcess: undefined },
        { name: "avatarUri", type: "string", PostProcess: undefined },
        { name: "size", type: "string", PostProcess: processMarkerStringSizes },
      ];

      const validateParams: {
        id: number;
        name: string;
        avatarUri: string;
        size: MARKER_SIZE_CATEGORIES;
      } = ValidateAllInputs(data, inputList);

      // NOTE: No authentication is required as the sessionId is being used.

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
      const imageCatalog: ImageCatalogDAO | null =
        await ImageCatalogDB.getInstance().selectByImageName(validateParams.avatarUri);
      if (imageCatalog === null) return;

      const summonDao: SummonsDao | null = await SummonsDB.getInstance().selectById(
        validateParams.id,
      );
      if (summonDao === null) return;
      summonDao.image_id = imageCatalog.img_catalog_id!;
      summonDao.name = validateParams.name;
      // Update the db instance
      SummonsDB.getInstance().update(summonDao);

      const summon: Summons | null =
        player.summons.find((item: Summons): boolean => item.id == validateParams.id) ?? null;
      if (summon === null) return;

      summon.name = validateParams.name;
      summon.avatarUri = imageCatalog.image_name;
      summon.size_category = validateParams.size;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("SummonHealth", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
        { name: "health", type: "number", PostProcess: undefined },
        { name: "total_health", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
        health: number;
        total_health: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.health = validateParams.health;
      summon.totalHealth = validateParams.total_health;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("summonHeal", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
        { name: "heal", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
        heal: number;
      } = ValidateAllInputs(data, inputList);

      // NOTE: No Authentication is required as the sessionId is being used.
      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.health += Math.abs(validateParams.heal);
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("summonDamage", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
        { name: "damage", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
        damage: number;
      } = ValidateAllInputs(data, inputList);

      // NOTE: No Authentication is required as the sessionId is being used.
      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.health -= Math.abs(validateParams.damage);
      if (summon.health < 0) summon.health = 0;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("summonDeathAdd", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
      ];
      // NOTE: No Authentication is required as the sessionId is being used.

      const validateParams: {
        id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.deathSaves += 1;
      if (summon.deathSaves > 3) summon.deathSaves = 3;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("summonDeathRemove", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.deathSaves -= 1;
      if (summon.deathSaves < 0) summon.deathSaves = 0;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("summonSaveAdd", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.lifeSaves += 1;
      if (summon.lifeSaves >= 3) {
        summon.lifeSaves = 0;
        summon.deathSaves = 0;
        summon.health = 1;
      }
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("summonSaveRemove", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.lifeSaves -= 1;
      if (summon.lifeSaves < 0) summon.lifeSaves = 0;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("toggleSummonVisibility", (client, data) => {
    try {
      // Include player_id as room.action can be called by multiple users (host vs player).
      const inputList: ValidationInputType[] = [
        { name: "id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.isVisible = !summon.isVisible;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("setSummonsStatuses", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "statuses", type: "array", PostProcess: undefined },
        { name: "id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        statuses: string[];
        id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;
      const summon: Summons | null =
        player.summons.find((val: Summons): boolean => val.id === validateParams.id) ?? null;
      if (summon === null) return;

      summon.statuses = validateParams.statuses.map((status: string): CharacterStatus => {
        return new CharacterStatus(status);
      });
    } catch (error) {
      console.error(error);
    }
  });
}
