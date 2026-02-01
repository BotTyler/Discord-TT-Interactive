import { Room } from "colyseus";
import { ImageCatalogDAO, ImageCatalogDB } from "../../Database/Tables/ImageCatalogDB";
import { MapDAO, MapDB } from "../../Database/Tables/MapDB";
import { CampaignsDao } from "../../shared/LoadDataInterfaces";
import { MapData } from "../../shared/Map";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { GameStateEnum, State } from "../../shared/State";
import {
  authenticateHostAction,
  saveState,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";

export function RegisterMapStateHandler(room: Room<State>): void {
  room.onMessage("setPlayerSize", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "size", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        size: number;
      } = ValidateAllInputs(data, inputList);

      if (room.state.map === null) return;

      room.state.map.iconHeight = validateParams.size;
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("setGameMap", async (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
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
      if (player === null) return;

      const imageCatalog: ImageCatalogDAO | null =
        await ImageCatalogDB.getInstance().selectByImageName(validateParams.mapBase64);
      if (imageCatalog === null) return;

      const mapId: number | null = await MapDB.getInstance().create(
        new MapDAO(imageCatalog.img_catalog_id!, validateParams.name, player.userId),
      );
      if (mapId === null) return;

      room.state.RESET_GAME();
      room.state.map = new MapData(
        {
          mapBase64: imageCatalog.image_name,
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
      console.error(error);
    }
  });

  room.onMessage("deleteMap", async (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "campaign_id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        campaign_id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      // MapDB.getInstance().delete;
      await MapDB.getInstance().deleteMap(validateParams.campaign_id);
      const resultingList: CampaignsDao[] = await MapDB.getInstance().selectMapByUserId(
        player.userId,
      );
      client.send("CampaignResult", resultingList);
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("clearMap", (client, _data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    saveState(room);
    room.state.RESET_GAME();
  });

  room.onMessage("nextInitiativeIndex", (client, _data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    if (room.state.map === null) return;
    const nInit: number = room.state.map.initiativeIndex + 1;
    const initSize: number = room.state.players.size + room.state.enemies.size;
    room.state.map.initiativeIndex = nInit % initSize;
  });
  room.onMessage("resetInitiativeIndex", (client, _data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    if (room.state.map === null) return;
    room.state.map.initiativeIndex = 0;
  });
}
