import { Client } from "colyseus";
import { EnemyDAO, EnemyDB } from "../../Database/Tables/EnemyDB";
import { ImageCatalogDAO, ImageCatalogDB } from "../../Database/Tables/ImageCatalogDB";
import { Enemy } from "../../shared/Enemy";
import { MARKER_SIZE_CATEGORIES } from "../../shared/MarkerOptions";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { CharacterStatus } from "../../shared/StatusTypes";
import {
  authenticateHostAction,
  processMarkerStringSizes,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";
import { StateHandlerRoom } from "../StateHandlerRoom";
import { logger } from "../../logger/logger";

export function RegisterEnemyStateHandler(room: StateHandlerRoom): void {
  room.onMessage("updateEnemyPosition", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Updating Enemy Position");
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
        logger.warn({ client: client.sessionId }, "Client not authorized for this action");
        return;
      }

      const pos: mLatLng = new mLatLng(+validateParams.pos.lat, +validateParams.pos.lng);
      const enemyId: string = validateParams.clientToChange;

      const enemy: Enemy | null = room.state.enemies.get(enemyId) ?? null;
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemyId: enemyId },
          "Enemy cannot be found in Room",
        );
        return;
      }

      enemy.position = pos;
      enemy.toPosition = [pos];
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("updateEnemyGhostPosition", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Updating Enemy Ghost position");
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
        logger.warn({ client: client.sessionId }, "Client not authorized for this action");
        return;
      }

      const pos: mLatLng[] = validateParams.pos.map(
        (point: mLatLng): mLatLng => new mLatLng(+point.lat, +point.lng),
      );
      const enemyId: string = validateParams.clientToChange;

      const enemy: Enemy | null = room.state.enemies.get(enemyId) ?? null;
      if (enemy === null) {
        logger.warn({ client: client.sessionId, enemy: enemyId }, "Enemy is not found within room");
        return;
      }

      enemy.toPosition = pos;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("addEnemy", async (client: Client, data: any): Promise<void> => {
    logger.info({ client: client.sessionId, data: data }, "Adding Enemy");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client not authorized for this action");
      return;
    }
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
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Client not found within Room");
        return;
      }

      // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
      const imageCatalog: ImageCatalogDAO | null =
        await ImageCatalogDB.getInstance().selectByImageSrc(validateParams.avatarUri);
      if (imageCatalog === null) {
        logger.warn(
          { client: client.sessionId, avatar: validateParams.avatarUri },
          "Image cannot be found in DB",
        );
        return;
      }

      const enemyId: number | null = await EnemyDB.getInstance().create(
        new EnemyDAO(imageCatalog.img_catalog_id!, validateParams.name),
      );
      if (enemyId === null) {
        logger.warn({ client: client.sessionId, enemy: enemyId }, "Enemy cannot be saved");
        return;
      }

      const enemy: Enemy = new Enemy({
        id: enemyId,
        avatarUri: imageCatalog.image_location,
        name: validateParams.name,
        size_category: validateParams.size,
      });
      enemy.position = new mLatLng(+validateParams.position.lat, +validateParams.position.lng);

      room.state.enemies.set(`${enemyId}`, enemy);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("deleteEnemy", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Starting Delete Enemy");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "id", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        id: string;
      } = ValidateAllInputs(data, inputList);

      room.state.enemies.delete(validateParams.id);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("EnemyHealth", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Updating Enemy Health");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
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
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.id },
          "Enemy cannot be found in Room",
        );
        return;
      }

      enemy.health = validateParams.health;
      enemy.totalHealth = validateParams.total_health;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("updateEnemy", async (client: Client, data: any): Promise<void> => {
    logger.info({ client: client.sessionId, data: data }, "Update Enemy");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
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
        await ImageCatalogDB.getInstance().selectByImageSrc(validateParams.avatarUri);
      if (imageCatalog === null) {
        logger.warn(
          { client: client.sessionId, avatar: validateParams.avatarUri },
          "Avatar not found in DB",
        );
        return;
      }

      const enemyDao: EnemyDAO | null = await EnemyDB.getInstance().selectById(+validateParams.id);
      if (enemyDao === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.id },
          "Enemy not found in DB",
        );
        return;
      }

      enemyDao.image_id = imageCatalog.img_catalog_id!;
      enemyDao.name = validateParams.name;
      EnemyDB.getInstance().update(enemyDao);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.id) ?? null;
      if (enemy === null) return;

      enemy.name = validateParams.name;
      enemy.avatarUri = validateParams.avatarUri;
      enemy.size_category = validateParams.size;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("changeEnemyInitiative", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Update Enemy Initiative");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }

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
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.id },
          "Enemy not found in Room",
        );
        return;
      }

      enemy.initiative = validateParams.initiative;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("enemyHeal", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Heal");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
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
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy not found in Room",
        );
        return;
      }

      enemy.health += Math.abs(validateParams.heal);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
  room.onMessage("enemyDamage", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Damage");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
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
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy not found within Room",
        );
        return;
      }

      enemy.health -= Math.abs(validateParams.damage);
      if (enemy.health < 0) enemy.health = 0;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
  room.onMessage("enemyDeathAdd", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Death Add");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy cannot be found within Room",
        );
        return;
      }

      enemy.deathSaves += 1;
      if (enemy.deathSaves > 3) enemy.deathSaves = 3;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
  room.onMessage("enemyDeathRemove", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Death Remove");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy cannot be found within Room",
        );
        return;
      }

      enemy.deathSaves -= 1;
      if (enemy.deathSaves < 0) enemy.deathSaves = 0;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
  room.onMessage("enemySaveAdd", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Save Add");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy cannot be found within Room",
        );
        return;
      }

      enemy.lifeSaves += 1;
      if (enemy.lifeSaves >= 3) {
        enemy.lifeSaves = 0;
        enemy.deathSaves = 0;
        enemy.health = 1;
      }
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
  room.onMessage("enemySaveRemove", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Save Remove");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy cannot be found within Room",
        );
        return;
      }

      enemy.lifeSaves -= 1;
      if (enemy.lifeSaves < 0) enemy.lifeSaves = 0;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
  room.onMessage("toggleEnemyVisibility", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Visibility Toggle");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "clientToChange", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        clientToChange: string;
      } = ValidateAllInputs(data, inputList);

      const enemy: Enemy | null = room.state.enemies.get(validateParams.clientToChange) ?? null;
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy cannot be found within Room",
        );
        return;
      }

      enemy.isVisible = !enemy.isVisible;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("setEnemyStatuses", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Enemy Statuses");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client is not authorized to perform this action");
      return;
    }
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
      if (enemy === null) {
        logger.warn(
          { client: client.sessionId, enemy: validateParams.clientToChange },
          "Enemy cannot be found within Room",
        );
        return;
      }

      enemy.statuses = validateParams.statuses.map((ele: string): CharacterStatus => {
        return new CharacterStatus(ele);
      });
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });
}
