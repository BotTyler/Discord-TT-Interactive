import { Room } from "colyseus";
import {
  EmhJoinInterface,
  EnemyMovementHistoryDB,
} from "../../Database/Tables/EnemyMovementHistoryDB";
import {
  InitiativeHistoryDAO,
  InitiativeHistoryDB,
} from "../../Database/Tables/InitiativeHistoryDB";
import { MapDB } from "../../Database/Tables/MapDB";
import { PlayerMovementHistoryDB } from "../../Database/Tables/PlayerMovementHistoryDB";
import { SaveHistoryDB } from "../../Database/Tables/SaveHistoryDB";
import { SummonsHistoryDB } from "../../Database/Tables/SummonsHistoryDB";
import { Enemy } from "../../shared/Enemy";
import {
  CampaignsDao,
  LoadCampaign,
  LoadSaveHistory,
  PlayerSaveState,
  ShJoinInterface,
} from "../../shared/LoadDataInterfaces";
import { MapData } from "../../shared/Map";
import { Player } from "../../shared/Player";
import { mLatLng } from "../../shared/PositionInterface";
import { State } from "../../shared/State";
import { CharacterStatus } from "../../shared/StatusTypes";
import { Summons } from "../../shared/Summons";
import {
  authenticateHostAction,
  saveState,
  ValidateAllInputs,
  ValidationInputType,
} from "../../Util/Utils";

export function RegisterSaveAndLoadStateHandler(room: Room<State>): void {
  room.onMessage("getCampaigns", async (client, _data) => {
    const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
    if (player === null) return client.error(666, "You are not Connected");
    const mapList: CampaignsDao[] = await MapDB.getInstance().selectMapByUserId(player.userId);

    client.send("CampaignResult", mapList);
  });

  room.onMessage("getVersionsByCampaign", async (client, data) => {
    try {
      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return client.error(666, "You are not Connected");
      const inputList: ValidationInputType[] = [
        { name: "campaign_id", type: "number", PostProcess: undefined },
      ];

      const validateParams: {
        campaign_id: number;
      } = ValidateAllInputs(data, inputList);
      const saveHistoryDao: LoadSaveHistory[] =
        await SaveHistoryDB.getInstance().selectByCampaignId(
          `${validateParams.campaign_id}`,
          player.userId,
        );

      client.send("CampaignVersionHistoryResult", saveHistoryDao);
    } catch (error) {
      console.error(error);
      client.send("CampaignVersionHistoryResult", []);
    }
  });

  // Function that will set all the values of a room based on the chosen save
  room.onMessage("loadMap", async (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "map_id", type: "number", PostProcess: undefined },
        { name: "history_id", type: "number", PostProcess: undefined },
      ];
      const validateParams: {
        map_id: number;
        history_id: number;
      } = ValidateAllInputs(data, inputList);

      const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
      if (player === null) return;

      const mapPromise = SaveHistoryDB.getInstance().selectByCampaignIdWithMap(
        validateParams.map_id,
        player.userId,
        validateParams.history_id,
      );
      const playerHistoryPromise =
        PlayerMovementHistoryDB.getInstance().getPlayerMovementAtHistoryId(
          validateParams.history_id,
        );
      const enemyHistoryPromise = EnemyMovementHistoryDB.getInstance().getEnemyMovementAtHistoryId(
        validateParams.history_id,
      );
      const ininitiativePromise = InitiativeHistoryDB.getInstance().selectByHistoryId(
        validateParams.history_id,
      );
      const summonsPromise = SummonsHistoryDB.getInstance().selectByHistoryId(
        validateParams.history_id,
      );

      const savedHistoryData: [
        LoadCampaign[],
        PlayerSaveState[],
        EmhJoinInterface[],
        InitiativeHistoryDAO[],
        ShJoinInterface[],
      ] = await Promise.all([
        mapPromise,
        playerHistoryPromise,
        enemyHistoryPromise,
        ininitiativePromise,
        summonsPromise,
      ]);

      const mapInterface: LoadCampaign = savedHistoryData[0][0];
      const playerStates: PlayerSaveState[] = savedHistoryData[1] ?? [];
      const enemyStates: EmhJoinInterface[] = savedHistoryData[2] ?? [];
      const initiativeSave: InitiativeHistoryDAO = savedHistoryData[3][0];
      const summonsState: ShJoinInterface[] = savedHistoryData[4];

      // Start from a clean slate
      room.state.RESET_GAME();

      // Load the map first.
      const map: MapData = new MapData(
        {
          mapBase64: mapInterface.image_name,
          width: mapInterface.width,
          height: mapInterface.height,
          iconHeight: mapInterface.player_size,
          initiativeIndex: initiativeSave.initiative_index,
        },
        +mapInterface.map_id,
      );
      room.state.map = map;

      // load player data.
      room.state.lastSavedPlayerContext = playerStates; // In case a user joins late stash these results.
      playerStates.forEach((playerState: PlayerSaveState): void => {
        const player: Player | null = room.state.getPlayerByUserId(playerState.player_id);
        if (player === null) {
          // Player has not joined yet.
          return;
        }

        player.position = new mLatLng(playerState.position_lat, playerState.position_lng);
        player.initiative = playerState.initiative;
        player.statuses = playerState.statuses.map(
          (status: string): CharacterStatus => new CharacterStatus(status),
        );
      });

      // Load the summons data
      room.state.lastSavedSummonsContext = summonsState; // Since summons are a subset in Player also stash these results.
      summonsState.forEach((summonState: ShJoinInterface): void => {
        const player: Player | null = room.state.getPlayerByUserId(summonState.player_id);
        if (player === null) {
          // Player has not joined yet.
          return;
        }

        const summon: Summons = new Summons({
          id: summonState.summons_id,
          player_id: player.userId,
          avatarUri: summonState.image_name,
          name: summonState.name,
          size_category: summonState.size_category,
          color: player.color,
        });
        summon.position = new mLatLng(summonState.position_lat, summonState.position_lng);
        summon.health = summonState.health;
        summon.totalHealth = summonState.total_health;
        summon.lifeSaves = summonState.life_saves;
        summon.deathSaves = summonState.death_saves;
        summon.isVisible = summonState.is_visible;
        player.summons = [...player.summons, summon];
        summon.statuses = summonState.statuses.map((status: string): CharacterStatus => {
          return new CharacterStatus(status);
        });
      });

      // Load Enemy Data
      enemyStates.forEach((enemyState: EmhJoinInterface): void => {
        const insertEnemy: Enemy = new Enemy({
          id: enemyState.enemy_id,
          avatarUri: enemyState.image_name,
          name: enemyState.name,
          size_category: enemyState.size_category,
        });

        insertEnemy.position = new mLatLng(enemyState.position_lat, enemyState.position_lng);
        insertEnemy.initiative = enemyState.initiative;
        insertEnemy.health = enemyState.health;
        insertEnemy.totalHealth = enemyState.total_health;
        insertEnemy.deathSaves = enemyState.death_saves;
        insertEnemy.lifeSaves = enemyState.life_saves;
        insertEnemy.isVisible = enemyState.is_visible;
        insertEnemy.statuses = enemyState.statuses.map((status: string): CharacterStatus => {
          return new CharacterStatus(status);
        });

        room.state.enemies.set(`${insertEnemy.id}`, insertEnemy);
      });
    } catch (error) {
      console.error(error);
    }
  });

  room.onMessage("exportMap", (client, data) => {
    if (!authenticateHostAction(client.sessionId, room)) return;
    try {
      const inputList: ValidationInputType[] = [
        { name: "isAutosave", type: "boolean", PostProcess: undefined },
      ];

      const validateParams: any = ValidateAllInputs(data, inputList);
      if (validateParams.isAutosave) {
        // For autosave we will not want to notify the client on a save.
        // we only want to notify when it was intentional.
        saveState(room);
      } else {
        saveState(room, client);
      }
    } catch (error) {
      console.error(error);
    }
  });
}
