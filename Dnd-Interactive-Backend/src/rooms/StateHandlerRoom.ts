import { Client, Room } from "colyseus";
import {
  EnemyMovementHistoryDAO,
  EnemyMovementHistoryDB,
} from "../Database/Tables/EnemyMovementHistoryDB";
import { InitiativeHistoryDAO, InitiativeHistoryDB } from "../Database/Tables/InitiativeHistoryDB";
import { PlayerDAO, PlayerDB } from "../Database/Tables/PlayerDB";
import {
  PlayerMovementHistoryDAO,
  PlayerMovementHistoryDB,
} from "../Database/Tables/PlayerMovementHistoryDB";
import { SaveHistoryDAO, SaveHistoryDB } from "../Database/Tables/SaveHistoryDB";
import { SummonsHistoryDao, SummonsHistoryDB } from "../Database/Tables/SummonsHistoryDB";
import { Enemy } from "../shared/Enemy";
import { ExportDataInterface } from "../shared/ExportDataInterface";
import { MARKER_SIZE_CATEGORIES } from "../shared/MarkerOptions";
import { mLatLng } from "../shared/PositionInterface";
import { IState, State } from "../shared/State";
import { CharacterStatus } from "../shared/StatusTypes";
import { Summons } from "../shared/Summons";
import { saveState, ValidateAllInputs, ValidationInputType } from "../Util/Utils";
import { Player } from "../shared/Player";
import { RegisterAssetStateHandler } from "./StateHandlers/AssetStateHandler";
import { RegisterDrawingStateHandler } from "./StateHandlers/DrawingStateHandler";
import { RegisterEnemyStateHandler } from "./StateHandlers/EnemyStateHandler";
import { RegisterGameStateHandler } from "./StateHandlers/GameStateHandler";
import { RegisterMapStateHandler } from "./StateHandlers/MapStateHandler";
import { RegisterPlayerStateHandler } from "./StateHandlers/PlayerStateHandler";
import { RegisterSaveAndLoadStateHandler } from "./StateHandlers/SaveAndLoadStateHandler";
import { RegisterSummonsStateHandler } from "./StateHandlers/SummonsStateHandler";
import { PlayerSaveState, ShJoinInterface } from "../shared/LoadDataInterfaces";

export class StateHandlerRoom extends Room<State> {
  maxClients = 1000;

  onCreate(options: IState) {
    this.setState(new State(options));

    RegisterPlayerStateHandler(this);
    RegisterSummonsStateHandler(this);
    RegisterDrawingStateHandler(this);

    RegisterGameStateHandler(this);
    RegisterEnemyStateHandler(this);

    RegisterMapStateHandler(this);

    RegisterAssetStateHandler(this);
    RegisterSaveAndLoadStateHandler(this);

    //EXTRA
    this.onMessage("*", (client, data) => {
      console.log(data);
      console.log("No message with that type found");
    });
  }

  onAuth(_client: any, _options: any, _req: any) {
    return true;
  }

  onJoin(client: Client, options: any) {
    // input validation
    try {
      const inputList: ValidationInputType[] = [
        { name: "userId", PostProcess: undefined, type: "string" },
        { name: "name", PostProcess: undefined, type: "string" },
        { name: "avatarUri", PostProcess: undefined, type: "string" },
      ];

      const validateParams: {
        userId: string;
        name: string;
        avatarUri: string;
      } = ValidateAllInputs(options, inputList);

      // Validation Complete Lets insert into the database and create the player
      PlayerDB.getInstance().create(new PlayerDAO(validateParams.userId, validateParams.name));
      const player: Player | null = this.state.getPlayerByUserId(validateParams.userId);
      this.state.sessionToUserId[`${client.sessionId}`] = validateParams.userId;

      if (player !== null) {
        player.isConnected = true;

        // Remove the OLD sessionid information from the corresponding arrays;
        delete this.state.sessionToUserId[player.sessionId];

        // Set the player with updated information. Stuff like the avatar uri and nickname which could change.
        player.name = validateParams.name;
        player.avatarUri = validateParams.avatarUri;
        player.sessionId = client.sessionId;
        return;
      }

      // A whole new player is being introduced.
      // See if the current save has some information we can utilize.
      const playerSaveData: PlayerSaveState | null =
        this.state.lastSavedPlayerContext.find(
          (element: PlayerSaveState): boolean => element.player_id === validateParams.userId,
        ) ?? null;

      const summonsSavedData: ShJoinInterface[] = this.state.lastSavedSummonsContext.filter(
        (ele: ShJoinInterface): boolean => ele.player_id === validateParams.userId,
      );

      const createdPlayer: Player = new Player({
        name: validateParams.name,
        userId: validateParams.userId,
        avatarUri: validateParams.avatarUri,
        sessionId: client.sessionId,
      });
      if (playerSaveData !== null) {
        // console.log(playerSaveData);
        createdPlayer.position = new mLatLng(
          +playerSaveData.position_lat,
          +playerSaveData.position_lng,
        );
        createdPlayer.initiative = +playerSaveData.initiative;
        createdPlayer.health = +playerSaveData.health;
        createdPlayer.totalHealth = +playerSaveData.total_health;
        createdPlayer.deathSaves = +playerSaveData.death_saves;
        createdPlayer.lifeSaves = +playerSaveData.life_saves;
        createdPlayer.statuses = playerSaveData.statuses.map(
          (stat: string): CharacterStatus => new CharacterStatus(stat),
        );
      }

      summonsSavedData.forEach((ele: ShJoinInterface): void => {
        const savedSummon: Summons = new Summons({
          id: ele.summons_id,
          player_id: createdPlayer.userId,
          avatarUri: ele.image_name,
          color: createdPlayer.color,
          name: ele.name,
          size_category: ele.size_category,
        });

        savedSummon.position = new mLatLng(+ele.position_lat, +ele.position_lng);
        savedSummon.health = +ele.health;
        savedSummon.totalHealth = +ele.total_health;
        savedSummon.deathSaves = +ele.death_saves;
        savedSummon.lifeSaves = +ele.life_saves;
        savedSummon.isVisible = ele.is_visible;
        savedSummon.statuses = ele.statuses.map(
          (stat: string): CharacterStatus => new CharacterStatus(stat),
        );

        createdPlayer.summons = [...createdPlayer.summons, savedSummon];
      });

      this.state.players.set(validateParams.userId, createdPlayer);
    } catch (error) {
      console.error(error);
      client.error(404, `${error}`);
    }
  }

  async onLeave(client: Client, consented: boolean) {
    const player: Player | null = this.state.getPlayerBySessionId(client.sessionId);
    if (player === null) return;

    player.isConnected = false;

    try {
      if (consented) {
        console.log("Consent Disconnect!!!");
        throw new Error("Consented Disconnect");
      }
      console.log("waiting for reconnect");
      // 7 because I like the number 7   0.0
      await this.allowReconnection(client, 7);
      console.log("Client Reconnected");
      player.isConnected = true;
    } catch (e) {
      console.log("Client Disconnected");
      const player = this.state.getPlayerBySessionId(client.sessionId)!;

      // Since this client disconnected lets make sure they are not the host
      if (!player.isHost) {
        return;
      }
      saveState(this);
      player.isHost = false; // If the user rejoins, this will need to be reset.
      // Since this is the host we need to panic. 0.o
      this.state.PANIC();
    }
  }

  onDispose() {
    console.log("Dispose StateHandlerRoom");
    // this.saveState();
    // this.state.RESET_GAME();
    // this.state.removeAllPlayers();
  }

  //#endregion
}
