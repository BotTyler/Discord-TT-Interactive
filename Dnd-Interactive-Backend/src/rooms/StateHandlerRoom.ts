import { Client, Room } from "colyseus";
import { PlayerDAO, PlayerDB } from "../Database/Tables/PlayerDB";
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
import { RegisterSummonsStateHandler } from "./StateHandlers/SummonsStateHandler";
import { PlayerSaveState, ShJoinInterface } from "../shared/LoadDataInterfaces";
import { RegisterSaveAndLoadStateHandler } from "./StateHandlers/SaveAndLoadStateHandler";
import { RegisterMessageStateHandler } from "./StateHandlers/MessageStateHandler";
import { logger } from "../logger/logger";

export class StateHandlerRoom extends Room {
  maxClients = 1000;
  state: State = new State({
    channelId: "",
    roomName: "",
  });

  onCreate(options: IState) {
    this.state.roomName = options.roomName;
    this.state.channelId = options.channelId;

    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering Player Handler",
    );
    RegisterPlayerStateHandler(this);
    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering Summons Handler",
    );
    RegisterSummonsStateHandler(this);
    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering Drawing Handler",
    );
    RegisterDrawingStateHandler(this);

    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering GameState Handler",
    );
    RegisterGameStateHandler(this);
    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering Enemy Handler",
    );
    RegisterEnemyStateHandler(this);

    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering Map Handler",
    );
    RegisterMapStateHandler(this);

    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering Asset Handler",
    );
    RegisterAssetStateHandler(this);
    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering SaveAndLoad Handler",
    );
    RegisterSaveAndLoadStateHandler(this);
    logger.info(
      { room: options.roomName, channelId: options.channelId },
      "Registering Message Handler",
    );
    RegisterMessageStateHandler(this);

    //EXTRA
    this.onMessage("*", (client, data) => {
      logger.error({ client: client.sessionId, data: data }, "No endpoint found for request");
    });
  }

  onAuth(client: any, _options: any, _req: any) {
    logger.info({ client: client.sessionid }, "Client authenticating");
    return true;
  }

  onJoin(client: Client, options: any) {
    // input validation
    logger.info({ client: client.sessionId, options: options }, "Client Joining Room");
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
        logger.info(
          { client: client.sessionId },
          "Client was already present in the room. Removing existing record for new connection.",
        );
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
      logger.info("Player not present. Determining if player was present on previous save");
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
          avatarUri: ele.image_location,
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
      logger.error({ err: error }, "Unexpected Error");
      client.error(404, `${error}`);
    }
  }

  // Unconsented Leave
  onDrop(client: Client<any>): void {
    logger.info(`Client Unconsented Disconnect: ${client.sessionId}`);
    // The client has around 30 seconds to reconnect.
    this.allowReconnection(client, 30);

    const player: Player | null = this.state.getPlayerBySessionId(client.sessionId);
    if (player === null) {
      logger.warn({ client: client.sessionId }, "Client was not in Room");
      return;
    }
    player.isConnected = false;
  }

  onReconnect(client: Client): void | Promise<any> {
    logger.info({ client: client.sessionId }, "Client Reconnected");
    const player: Player | null = this.state.getPlayerBySessionId(client.sessionId);
    if (player === null) {
      logger.warn({ client: client.sessionId }, "Client Reconnected, but not found in Room");
      return;
    }
    player.isConnected = true;
  }

  // Player is leaving
  onLeave(client: Client): void {
    logger.info({ client: client.sessionId }, "Client Leavining");
    const player: Player | null = this.state.getPlayerBySessionId(client.sessionId);
    if (player === null) {
      logger.warn(
        { client: client.sessionId },
        "Client leaving, but they are not part of the Room",
      );
      return;
    }
    player.isConnected = false;

    // If this is the host. Make sure to reset the state.
    if (!player.isHost) {
      logger.info({ player: player }, "Player is not host, throw away the ticket");
      return;
    }
    saveState(this);
    player.isHost = false;
    logger.info("State of the game has become soft locked! Panic to save the Players XD");
    this.state.PANIC();
  }

  onDispose() {
    logger.info("Disposing of session");
    this.state.RESET_GAME();
  }

  //#endregion
}
