import { Client } from "colyseus";
import { ImageCatalogDAO, ImageCatalogDB } from "../../Database/Tables/ImageCatalogDB";
import { MapDAO, MapDB } from "../../Database/Tables/MapDB";
import { CampaignsDao } from "../../shared/LoadDataInterfaces";
import { MapData } from "../../shared/Map";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { GameStateEnum } from "../../shared/State";
import {
  authenticateHostAction,
  saveState,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";
import { StateHandlerRoom } from "../StateHandlerRoom";
import { logger } from "../../logger/logger";

export function RegisterMapStateHandler(room: StateHandlerRoom): void {
  room.onMessage("setPlayerSize", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started setPlayerSize");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "size", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        size: number;
      } = ValidateAllInputs(data, inputList);

      if (room.state.map === null) {
        logger.warn({ client: client.sessionId }, "Room map not initialized");
        return;
      }

      room.state.map.iconHeight = validateParams.size;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("setGameMap", async (client: Client, data: any): Promise<void> => {
    logger.info({ client: client.sessionId, data: data }, "Started setGameMap");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "mapBase64", type: "string", PostProcess: undefined },
        { name: "iconHeight", type: "number", PostProcess: undefined },
        { name: "name", type: "string", PostProcess: undefined },
      ];

      const validateParams: {
        mapBase64: string;
        iconHeight: number;
        name: string;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player cannot be found in the Room");
        return;
      }

      const imageCatalog: ImageCatalogDAO | null =
        await ImageCatalogDB.getInstance().selectByImageSrc(validateParams.mapBase64);
      if (imageCatalog === null) {
        logger.warn(
          { client: client.sessionId, map: validateParams.mapBase64 },
          "Map Image cannot be found",
        );
        return;
      }

      const mapId: number | null = await MapDB.getInstance().create(
        new MapDAO(imageCatalog.img_catalog_id!, validateParams.name, player.userId),
      );
      if (mapId === null) return;

      logger.info("Resetting Game");
      room.state.RESET_GAME();
      room.state.map = new MapData(
        {
          mapBase64: imageCatalog.image_location,
          width: imageCatalog.width,
          height: imageCatalog.height,
          iconHeight: validateParams.iconHeight,
          initiativeIndex: 0,
        },
        +mapId,
      );
      // Separate Players to make sure they do not overlap.
      let index: number = 0;
      room.state.players.forEach((player: Player): void => {
        player.position = new mLatLng(0, data.iconHeight * index);
        index++;
      });
      room.state.gameState = GameStateEnum.HOSTPLAY;

      // Make sure at least one save is made.
      saveState(room);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("deleteMap", async (client: Client, data: any): Promise<void> => {
    logger.info({ client: client.sessionId, data: data }, "Started deleteMap");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    try {
      const inputList: ValidationInputType[] = [
        { name: "campaign_id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        campaign_id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) {
        logger.warn({ client: client.sessionId }, "Player is not found within Room");
        return;
      }

      // MapDB.getInstance().delete;
      await MapDB.getInstance().deleteMap(validateParams.campaign_id);
      const resultingList: CampaignsDao[] = await MapDB.getInstance().selectMapByUserId(
        player.userId,
      );
      client.send("CampaignResult", resultingList);
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  });

  room.onMessage("clearMap", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started clearMap");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    saveState(room);
    logger.info("Resetting Game");
    room.state.RESET_GAME();
  });

  room.onMessage("nextInitiativeIndex", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started nextInitiativeIndex");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    if (room.state.map === null) {
      logger.warn({ client: client.sessionId }, "Room map is not initialized");
      return;
    }
    const nInit: number = room.state.map.initiativeIndex + 1;
    const initSize: number = room.state.players.size + room.state.enemies.size;
    room.state.map.initiativeIndex = nInit % initSize;
  });
  room.onMessage("resetInitiativeIndex", (client: Client, data: any): void => {
    logger.info({ client: client.sessionId, data: data }, "Started resetInitiativeIndex");
    if (!authenticateHostAction(client.sessionId, room)) {
      logger.warn({ client: client.sessionId }, "Client Is not authorized for this action");
      return;
    }
    if (room.state.map === null) {
      logger.warn({ client: client.sessionId }, "Room Map is not initialized");
      return;
    }
    room.state.map.initiativeIndex = 0;
  });
}
