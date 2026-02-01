import { Room } from "colyseus";
import { EnemyDAO, EnemyDB } from "../../Database/Tables/EnemyDB";
import { ImageCatalogDAO, ImageCatalogDB } from "../../Database/Tables/ImageCatalogDB";
import { Enemy } from "../../shared/Enemy";
import { MARKER_SIZE_CATEGORIES } from "../../shared/MarkerOptions";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { State } from "../../shared/State";
import { CharacterStatus } from "../../shared/StatusTypes";
import {
  authenticateHostAction,
  processMarkerStringSizes,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";

export function RegisterEnemyStateHandler(room: Room<State>): void {
  room.onMessage("updateEnemyPosition", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "pos", type: "object", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        pos: mLatLng;
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      if (!authenticateHostAction(client.sessionId, room)) {
        return;
      }
      console.log("Authenticated Enemy Movement");
      const pos: mLatLng = new mLatLng(+validateParams.pos.lat, +validateParams.pos.lng);
      const enemyId: string = validateParams.clientToChange;

      const enemy: Enemy | null = room.state.enemies.get(enemyId) ?? null;
      if (enemy === null) return;

      enemy.position = pos;
      enemy.toPosition = [pos];
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("updateEnemyGhostPosition", (client, data) => {
    try {
      const inputList: ValidationInputType[] = [
        { name: "pos", type: "object", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        pos: mLatLng[];
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);
      if (!authenticateHostAction(client.sessionId, room)) {
        return;
      }

      const pos: mLatLng[] = validateParams.pos.map(
        (point: mLatLng): mLatLng => new mLatLng(+point.lat, +point.lng),
      );
      const enemyId: string = validateParams.clientToChange;

      const enemy: Enemy | null = room.state.enemies.get(enemyId) ?? null;
      if (enemy === null) return;

      enemy.toPosition = pos;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("addEnemy", async (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "name", type: "string", PostProcess: undefined },
        { name: "avatarUri", type: "string", PostProcess: undefined },
        { name: "position", type: "object", PostProcess: undefined },
        { name: "size", type: "string", PostProcess: processMarkerStringSizes },
      ];

      const validateParams: {
        name: string;
        avatarUri: string;
        position: mLatLng;
        size: MARKER_SIZE_CATEGORIES;
      } = ValidateAllInputs(data, inputList);
      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
      const imageCatalog: ImageCatalogDAO | null =
        await ImageCatalogDB.getInstance().selectByImageName(validateParams.avatarUri);
      if (imageCatalog === null) return;

      const enemyId: number | null = await EnemyDB.getInstance().create(
        new EnemyDAO(imageCatalog.img_catalog_id!, validateParams.name),
      );
      if (enemyId === null) return;

      const enemy: Enemy = new Enemy({
        id: enemyId,
        avatarUri: imageCatalog.image_name,
        name: validateParams.name,
        size_category: validateParams.size,
      });
      enemy.position = new mLatLng(+validateParams.position.lat, +validateParams.position.lng);
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("deleteEnemy", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        id: string;
      } = ValidateAllInputs(data, inputList);

      room.state.enemies.delete(validateParams.id);
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("EnemyHealth", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "string", PostProcess: undefined },
        { name: "health", type: "number", PostProcess: undefined },
        { name: "total_health", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: string;
        health: number;
        total_health: number;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.id) ?? null;
      if (enemy === null) return;

      enemy.health = validateParams.health;
      enemy.totalHealth = validateParams.total_health;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("updateEnemy", async (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "string", PostProcess: undefined },
        { name: "name", type: "string", PostProcess: undefined },
        { name: "avatarUri", type: "string", PostProcess: undefined },
        { name: "size", type: "string", PostProcess: processMarkerStringSizes },
      ];

      const validateParams: {
        id: string;
        name: string;
        avatarUri: string;
        size: MARKER_SIZE_CATEGORIES;
      } = ValidateAllInputs(data, inputList);

      // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
      const imageCatalog: ImageCatalogDAO | null =
        await ImageCatalogDB.getInstance().selectByImageName(validateParams.avatarUri);
      if (imageCatalog === null) return;

      const enemyDao: EnemyDAO | null = await EnemyDB.getInstance().selectById(+validateParams.id);
      if (enemyDao === null) return;

      enemyDao.image_id = imageCatalog.img_catalog_id!;
      enemyDao.name = validateParams.name;
      EnemyDB.getInstance().update(enemyDao);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.id) ?? null;
      if (enemy === null) return;

      enemy.name = validateParams.name;
      enemy.avatarUri = validateParams.avatarUri;
      enemy.size_category = validateParams.size;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("changeEnemyInitiative", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "string", PostProcess: undefined },
        { name: "initiative", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        id: string;
        initiative: number;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.id) ?? null;
      if (enemy === null) return;

      enemy.initiative = validateParams.initiative;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("enemyHeal", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "heal", type: "number", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        heal: number;
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.health += Math.abs(validateParams.heal);
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("enemyDamage", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "damage", type: "number", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        damage: number;
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.health -= Math.abs(validateParams.damage);
      if (enemy.health < 0) enemy.health = 0;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("enemyDeathAdd", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.deathSaves += 1;
      if (enemy.deathSaves > 3) enemy.deathSaves = 3;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("enemyDeathRemove", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.deathSaves -= 1;
      if (enemy.deathSaves < 0) enemy.deathSaves = 0;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("enemySaveAdd", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.lifeSaves += 1;
      if (enemy.lifeSaves >= 3) {
        enemy.lifeSaves = 0;
        enemy.deathSaves = 0;
        enemy.health = 1;
      }
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("enemySaveRemove", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.lifeSaves -= 1;
      if (enemy.lifeSaves < 0) enemy.lifeSaves = 0;
    } catch (error) {
      console.error(error);
    }
  });
  room.onMessage("toggleEnemyVisibility", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.isVisible = !enemy.isVisible;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("setEnemyStatuses", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "statuses", type: "array", PostProcess: undefined },
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        statuses: string[];
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) return;

      enemy.statuses = validateParams.statuses.map((ele: string): CharacterStatus => {
        return new CharacterStatus(ele);
      });
    } catch (error) {
      console.error(error);
    }
  });
}
