import { MapSchema, Schema, type } from "@colyseus/schema";
import { ArcDrawing, BeamDrawing, CircleDrawing, CubeDrawing } from "./DrawingInterface";
import { Enemy } from "./Enemy";
import { ExportDataInterface } from "./ExportDataInterface";
import {
  LoadEnemyInterface,
  LoadFogInterface,
  LoadMapInterface,
  LoadPlayerInterface,
  LoadSummonsInterface,
} from "./LoadDataInterfaces";
import { MapData, MapFogPolygon } from "./Map";
import { Player, TPlayerOptions } from "./Player";
import { mLatLng } from "./PositionInterface";
import { Summons } from "./Summons";
import { CharacterStatus, Conditions } from "./StatusTypes";

export interface IState {
  roomName: string;
  channelId: string;
}

export enum GameStateEnum {
  MAINMENU,
  HOSTPLAY,
  ALLPLAY,
}

export type MapMovementType = "free" | "grid";

export class State extends Schema {
  // This value will hold the data based on a save.
  // In the case where a player joins AFTER a load is in progress, this is to make sure their data is not removed.
  private lastSavedPlayerContext: LoadPlayerInterface[] = [];
  private lastSavedSummonsContext: LoadSummonsInterface[] = [];

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type(MapData)
  map: MapData | null = null;

  @type("number")
  gameState: GameStateEnum = GameStateEnum.MAINMENU;

  @type({ map: "string" })
  sessionToUserId = new MapSchema<string>();

  @type("string")
  mapMovement: MapMovementType = "free";

  @type("boolean")
  gridShowing: boolean = false;

  @type("string")
  gridColor: string = "rgba(255, 255, 255, 0.8)";

  @type("string")
  public roomName: string;

  @type("string")
  public channelId: string;

  // serverAttribute = "this attribute wont be sent to the client-side";

  @type("string")
  currentHostUserId: string | undefined;

  // Init
  constructor(attributes: IState) {
    super();
    this.roomName = attributes.roomName;
    this.channelId = attributes.channelId;
  }

  //#region Helper Functions
  _getPlayerByUserId(clientID: string): Player | undefined {
    return this.players.get(clientID);
  }
  _getPlayerBySessionId(sessionId: string): Player | undefined {
    return this.players.get(this.sessionToUserId.get(sessionId) ?? "*");
  }

  // If this method is run, somethign has happened that we need to reset
  PANIC(): boolean {
    this.gameState = GameStateEnum.MAINMENU;
    this.currentHostUserId = undefined;

    return true;
  }

  // Compeltely reset all values related to a "playable" state.
  RESET_GAME(): boolean {
    this.players.forEach((player: Player): void => {
      player.position = new mLatLng(0, 0);
      player.statuses = [];
      player.summons = [];
      player.drawings = [];
      player.arcDrawing = null;
      player.beamDrawing = null;
      player.circleDrawing = null;
      player.cubeDrawing = null;
      player.deathSaves = 0;
      player.lifeSaves = 0;
      player.health = player.totalHealth;
    });
    this.lastSavedPlayerContext = [];
    this.lastSavedSummonsContext = [];
    this.map = null;
    return true;
  }
  //#endregion

  //#region Grid
  setGridColor(_sessionId: string, color: string) {
    this.gridColor = color;
  }

  setGridShowing(_sessionId: string, isShowing: boolean) {
    this.gridShowing = isShowing;
  }
  //#endregion

  //#region Players
  createPlayer(sessionId: string, playerOptions: TPlayerOptions) {
    const player = this._getPlayerByUserId(playerOptions.userId);
    this.sessionToUserId.set(sessionId, playerOptions.userId);
    if (player) {
      player.isConnected = true;
      // Remove the current sessionid information from the corresponding arrays;
      this.sessionToUserId.delete(player.sessionId);
      // Set the player with updated information. Stuff like the avatar uri and nickname which could change.
      player.name = playerOptions.name;
      player.avatarUri = playerOptions.avatarUri;
      player.sessionId = sessionId;
      return;
    }

    // A whole new player is being introduced.
    // See if the current save has some information we can utilize.
    const playerSaveData: LoadPlayerInterface | null =
      this.lastSavedPlayerContext.find(
        (element: LoadPlayerInterface): boolean => element.player_id === playerOptions.userId,
      ) ?? null;

    const summonsSavedData: LoadSummonsInterface[] = this.lastSavedSummonsContext.filter(
      (ele: LoadSummonsInterface): boolean => ele.player_id === playerOptions.userId,
    );

    const createdPlayer: Player = new Player({ ...playerOptions, sessionId });
    if (playerSaveData !== null) {
      // console.log(playerSaveData);
      createdPlayer.position = new mLatLng(
        +playerSaveData.position_lat,
        +playerSaveData.position_lng,
      );
      createdPlayer.initiative = +playerSaveData.initiative;
      createdPlayer.health = +playerSaveData.health;
      createdPlayer.totalHealth = +playerSaveData.totalHealth;
      createdPlayer.deathSaves = +playerSaveData.deathSaves;
      createdPlayer.lifeSaves = +playerSaveData.lifeSaves;
      createdPlayer.statuses = playerSaveData.statuses.map(
        (stat: string): CharacterStatus => new CharacterStatus(stat),
      );
    }

    summonsSavedData.forEach((ele: LoadSummonsInterface): void => {
      const savedSummon: Summons = new Summons({
        id: ele.summons_id,
        player_id: createdPlayer.userId,
        avatarUri: ele.image_name,
        color: createdPlayer.color,
        name: ele.name,
        size: ele.size,
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

    this.players.set(playerOptions.userId, createdPlayer);
  }

  setPlayerConnected(sessionId: string, data: { connection: boolean }): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.isConnected = data.connection;
    return true;
  }

  removePlayer(sessionId: string) {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return;
    this.players.delete(player.userId);
    this.sessionToUserId.delete(sessionId);
  }

  removeAllPlayers() {
    this.players.clear();
    this.sessionToUserId.clear();
  }

  changePlayerColor(sessionId: string, data: { color: string }): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    player.color = data.color;

    // Make sure to update the summons
    player.summons.forEach((val: Summons) => {
      val.color = data.color;
    });
    return true;
  }

  changePlayerInitiative(
    sessionId: string,
    data: { initiative: number; clientToChange: string },
  ): boolean {
    const player = this._getPlayerByUserId(data.clientToChange);
    if (player === undefined) return false;
    player.initiative = data.initiative;
    return true;
  }

  setPlayerStatuses(sessionid: string, data: { statuses: string[] }): boolean {
    const player = this._getPlayerBySessionId(sessionid);
    if (player === undefined) return false;
    player.statuses = data.statuses.map((status: string): CharacterStatus => {
      return new CharacterStatus(status);
    });
    return true;
  }
  // changePlayerTotalHp(sessionId: string, data: { totalHp: number }): boolean {
  //   const player = this._getPlayerBySessionId(sessionId);
  //   if (player === undefined) return false;
  //   player.totalHealth = data.totalHp;
  //   return true;
  // }
  //
  // changePlayerHp(sessionId: string, data: { hp: number }): boolean {
  //   const player = this._getPlayerBySessionId(sessionId);
  //   if (player === undefined) return false;
  //   player.health = data.hp;
  //   return true;
  // }
  //
  // healPlayer(sessionId: string, data: { clientToChange: string; heal: number }): boolean {
  //   const player = this._getPlayerByUserId(data.clientToChange);
  //   if (player === undefined) return false;
  //   player.health += Math.abs(data.heal);
  //   if (player.health > player.totalHealth) {
  //     player.health = player.totalHealth;
  //   }
  //   return true;
  // }
  // damagePlayer(sessionId: string, data: { clientToChange: string; damage: number }): boolean {
  //   const player = this._getPlayerByUserId(data.clientToChange);
  //   if (player === undefined) return false;
  //   player.health -= Math.abs(data.damage);
  //   if (player.health <= 0) {
  //     player.health = 0;
  //   }
  //   return true;
  // }
  // addPlayerDeath(sessionId: string, data: { clientToChange: string }): boolean {
  //   const player = this._getPlayerByUserId(data.clientToChange);
  //   if (player === undefined) return false;
  //   player.deathSaves += 1;
  //   return true;
  // }
  // removePlayerDeath(sessionId: string, data: { clientToChange: string }): boolean {
  //   const player = this._getPlayerByUserId(data.clientToChange);
  //   if (player === undefined) return false;
  //   player.deathSaves -= 1;
  //   return true;
  // }
  // addPlayerSave(sessionId: string, data: { clientToChange: string }): boolean {
  //   const player = this._getPlayerByUserId(data.clientToChange);
  //   if (player === undefined) return false;
  //   player.lifeSaves += 1;
  //   if (player.lifeSaves >= 3) {
  //     player.lifeSaves = 0;
  //     player.deathSaves = 0;
  //     player.health = 1;
  //   }
  //   return true;
  // }
  // removePlayerSave(sessionId: string, data: { clientToChange: string }): boolean {
  //   const player = this._getPlayerByUserId(data.clientToChange);
  //   if (player === undefined) return false;
  //   player.lifeSaves -= 1;
  //   return true;
  // }

  //#endregion

  //#region Movement
  updatePosition(
    sessionId: string,
    position: { lat: number; lng: number; clientToChange: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    const player = this._getPlayerBySessionId(sessionId);
    const playerToMove = this._getPlayerByUserId(position.clientToChange);
    if (player === undefined || playerToMove === undefined) return false; // Player does not exist

    // good to go move the position
    playerToMove.position = new mLatLng(position.lat, position.lng);
    playerToMove.toPosition = [new mLatLng(position.lat, position.lng)]; // Player is replacing the ghost character.
    return true;
  }

  setPlayerGhostPosition(
    sessionId: string,
    position: { pos: { lat: number; lng: number }[]; clientToChange: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    const player = this._getPlayerBySessionId(sessionId);
    const playerToMove = this._getPlayerByUserId(position.clientToChange);
    if (player === undefined || playerToMove === undefined) return false; // Player does not exist

    // good to go! move ghost to the position.
    playerToMove.toPosition = position.pos.map((val: { lat: number; lng: number }): mLatLng => {
      return new mLatLng(val.lat, val.lng);
    });
    return true;
  }

  updateEnemyPosition(
    sessionId: string,
    position: { lat: number; lng: number; clientToChange: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    if (this.map === null) return false;
    const player = this._getPlayerBySessionId(sessionId);
    const enemyToMove = this.map.enemy.get(position.clientToChange);

    if (player === undefined || enemyToMove === undefined) return false; // Player does not exist

    enemyToMove.position = new mLatLng(position.lat, position.lng);
    enemyToMove.toPosition = [new mLatLng(position.lat, position.lng)];
    return true;
  }
  setEnemyGhostPosition(
    sessionId: string,
    position: { pos: { lat: number; lng: number }[]; clientToChange: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    if (this.map === null) return false;
    const player = this._getPlayerBySessionId(sessionId);
    const enemyToMove = this.map.enemy.get(position.clientToChange);

    if (player === undefined || enemyToMove === undefined) return false; // Player does not exist

    enemyToMove.toPosition = position.pos.map((val: { lat: number; lng: number }): mLatLng => {
      return new mLatLng(val.lat, val.lng);
    });
    return true;
  }

  //#endregion

  //#region Drawings
  addDrawing(sessionId: string, data: { lat: number; lng: number }[]): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.drawings = data.map((val: { lat: number; lng: number }): mLatLng => {
      return new mLatLng(val.lat, val.lng);
    });

    return true;
  }

  removeDrawing(sessionId: string, data: { playerId: string }): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    const playerTo = this._getPlayerByUserId(data.playerId);
    if (player === undefined || playerTo === undefined) return false; // Player does not exist

    playerTo.drawings = [];

    return true;
  }

  clearDrawings(sessionId: string): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.drawings = [];
    return true;
  }

  //#region Cubes
  addCube(
    sessionId: string,
    data: { center: { lat: number; lng: number }; radius: number },
  ): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.cubeDrawing = new CubeDrawing(
      new mLatLng(data.center.lat, data.center.lng),
      data.radius,
    );
    return true;
  }

  removeCube(sessionId: string): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.cubeDrawing = null;
    return true;
  }
  //#endregion
  //#region Circle
  addCircle(
    sessionId: string,
    data: { center: { lat: number; lng: number }; radius: number },
  ): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.circleDrawing = new CircleDrawing(
      new mLatLng(data.center.lat, data.center.lng),
      data.radius,
    );
    return true;
  }

  removeCircle(sessionId: string): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.circleDrawing = null;
    return true;
  }
  //#endregion
  //#region Arc
  addArc(
    sessionId: string,
    data: {
      center: { lat: number; lng: number };
      toLocation: { lat: number; lng: number };
      angle: number;
    },
  ): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.arcDrawing = new ArcDrawing(
      new mLatLng(data.center.lat, data.center.lng),
      new mLatLng(data.toLocation.lat, data.toLocation.lng),
      data.angle,
    );
    return true;
  }

  removeArc(sessionId: string): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.arcDrawing = null;
    return true;
  }
  //#endregion
  //#region Beam
  addBeam(
    sessionId: string,
    data: { start: { lat: number; lng: number }; end: { lat: number; lng: number }; width: number },
  ): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    player.beamDrawing = new BeamDrawing(
      new mLatLng(data.start.lat, data.start.lng),
      new mLatLng(data.end.lat, data.end.lng),
      data.width,
    );
    return true;
  }

  removeBeam(sessionId: string): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.beamDrawing = null;
    return true;
  }
  //#endregion

  //#endregion

  //#region Host
  setHost(sessionId: string): boolean {
    if (this.currentHostUserId !== undefined) return false;

    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    player.isHost = true;
    this.currentHostUserId = player.userId;

    this.RESET_GAME();

    return true;
  }

  removeHost(sessionId: string): boolean {
    if (this.currentHostUserId === undefined) return false;

    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    if (player.userId !== this.currentHostUserId) return false; // different people do not change host
    player.isHost = false;
    this.currentHostUserId = undefined;
    return true;
  }
  //#endregion

  //#region GameState
  setGameState(sessionId: string, data: { gameState: GameStateEnum }): boolean {
    this.gameState = data.gameState;
    return true;
  }
  //#endregion

  //#region MapData
  setMap(
    sessionId: string,
    data: {
      id: number;
      image_name: string;
      width: number;
      height: number;
      iconHeight: number;
    },
  ): boolean {
    this.RESET_GAME();
    this.map = new MapData(
      {
        mapBase64: data.image_name,
        width: data.width,
        height: data.height,
        iconHeight: data.iconHeight,
        fogs: new MapSchema<MapFogPolygon>({}),
        enemy: new MapSchema<Enemy>({}),
        initiativeIndex: 0,
      },
      data.id,
    );

    let index: number = 0;
    this.players.forEach((player: Player): void => {
      player.position = new mLatLng(0, data.iconHeight * index);
      index++;
    });
    return false;
  }

  setMapMovement(mapMovement: MapMovementType): boolean {
    this.mapMovement = mapMovement;
    return true;
  }

  setPlayerSize(sessionId: string, data: { size: number }): boolean {
    if (this.map === null) return false;
    this.map.iconHeight = data.size;
    return true;
  }

  nextInitiative(): boolean {
    if (this.map === null) return false;

    const nInit = this.map.initiativeIndex + 1;
    const initSize = this.players.size + this.map.enemy.size;
    this.map.initiativeIndex = nInit % initSize;

    return true;
  }

  resetInitiativeIndex(): boolean {
    if (this.map === null) return false;
    this.map.initiativeIndex = 0;
    return true;
  }

  //#region Enemy
  addEnemy(
    sessionId: string,
    data: {
      id: number;
      avatarUri: string;
      name: string;
      position: { lat: number; lng: number };
      size: number;
      health: number;
      totalHealth: number;
    },
  ): boolean {
    if (this.map === null) return false;

    const newEnemy: Enemy = new Enemy({
      id: data.id,
      avatarUri: data.avatarUri,
      name: data.name,
      size: data.size,
    });
    newEnemy.position = new mLatLng(data.position.lat, data.position.lng);
    newEnemy.health = data.health;
    newEnemy.totalHealth = data.totalHealth;
    newEnemy.deathSaves = 0;
    newEnemy.lifeSaves = 0;
    newEnemy.isVisible = true;
    newEnemy.initiative = 0;

    this.map.enemy.set(`${data.id}`, newEnemy);
    return true;
  }
  removeEnemy(sessionId: string, data: { id: string }): boolean {
    if (this.map === null) return false;
    this.map.enemy.delete(data.id);
    return true;
  }
  updateEnemyInformation(
    sessionId: string,
    data: {
      id: string;
      name: string;
      size: number;
      avatarUri: string;
      health: number;
      totalHealth: number;
    },
  ): boolean {
    if (this.map === null) return false;
    const enemy = this.map.enemy.get(data.id);
    if (enemy === undefined) return false;
    enemy.name = data.name;
    enemy.size = data.size;
    enemy.avatarUri = data.avatarUri;
    enemy.health = data.health;
    enemy.totalHealth = data.totalHealth;
    return true;
  }

  updateEnemyInitiative(session_id: string, data: { id: string; initiative: number }): boolean {
    if (this.map === null) return false;
    const enemy = this.map.enemy.get(data.id);
    if (enemy === undefined) return false;

    enemy.initiative = data.initiative;
    return true;
  }

  healEnemy(sessionId: string, data: { clientToChange: string; heal: number }): boolean {
    if (this.map === null) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.health += Math.abs(data.heal);

    return true;
  }
  damageEnemy(sessionId: string, data: { clientToChange: string; damage: number }): boolean {
    if (this.map === null) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.health -= Math.abs(data.damage);
    if (player.health <= 0) {
      player.health = 0;
    }

    return true;
  }
  addEnemyDeath(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === null) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.deathSaves += 1;
    if (player.deathSaves > 3) player.deathSaves = 3;
    return true;
  }
  removeEnemyDeath(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === null) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.deathSaves -= 1;
    if (player.deathSaves < 0) player.deathSaves = 0;

    return true;
  }
  addEnemySave(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === null) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.lifeSaves += 1;
    if (player.lifeSaves >= 3) {
      player.lifeSaves = 0;
      player.deathSaves = 0;
      player.health = 1;
    }

    return true;
  }
  removeEnemySave(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === null) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.lifeSaves -= 1;
    if (player.lifeSaves < 0) player.lifeSaves = 0;

    return true;
  }
  toggleEnemyVisibility(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === null) return false;

    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.isVisible = !player.isVisible;
    return true;
  }
  setEnemyStatuses(
    sessionid: string,
    data: { statuses: string[]; clientToChange: string },
  ): boolean {
    if (this.map === null) return false;

    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.statuses = data.statuses.map((status: string): CharacterStatus => {
      return new CharacterStatus(status);
    });
    return true;
  }

  //#endregion

  //#region Summons
  updateSummonPosition(
    sessionId: string,
    data: { pos: { lat: number; lng: number }; id: number; player_id: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    const player: Player | null = this._getPlayerByUserId(data.player_id) ?? null;

    if (player === null) return false; // Player does not exist
    const summon: Summons | null =
      player.summons.find((val: Summons) => val.id === data.id) ?? null;
    if (summon === null) return false;

    summon.position = new mLatLng(data.pos.lat, data.pos.lng);
    summon.toPosition = [new mLatLng(data.pos.lat, data.pos.lng)];
    return true;
  }

  setSummonGhostPosition(
    sessionId: string,
    data: { pos: { lat: number; lng: number }[]; id: number; player_id: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    const player: Player | null = this._getPlayerByUserId(data.player_id) ?? null;

    if (player === null) return false; // Player does not exist
    const summon: Summons | null =
      player.summons.find((val: Summons) => val.id === data.id) ?? null;
    if (summon === null) return false;

    summon.toPosition = data.pos.map((val: { lat: number; lng: number }): mLatLng => {
      return new mLatLng(val.lat, val.lng);
    });

    return true;
  }

  addSummon(
    sessionId: string,
    data: {
      id: number;
      player_id: string;
      avatarUri: string;
      name: string;
      position: { lat: number; lng: number };
      size: number;
      health: number;
      totalHealth: number;
      deathSaves: number;
      lifeSaves: number;
    },
  ): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const insertSummon: Summons = new Summons({
      player_id: player.userId,
      id: data.id,
      avatarUri: data.avatarUri,
      name: data.name,
      size: data.size,
      color: player.color,
    });

    insertSummon.position = new mLatLng(data.position.lat, data.position.lng);
    insertSummon.health = data.health;
    insertSummon.totalHealth = data.totalHealth;
    insertSummon.lifeSaves = data.lifeSaves;
    insertSummon.deathSaves = data.deathSaves;
    insertSummon.isVisible = true;

    player.summons = [...player.summons, insertSummon];
    return true;
  }

  removeSummon(sessionId: string, data: { id: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    player.summons = player.summons.filter((summon: Summons): boolean => summon.id !== data.id);

    return true;
  }

  updateSummonsInformation(
    sessionId: string,
    data: {
      id: number;
      avatarUri: string;
      name: string;
      health: number;
      totalHealth: number;
      size: number;
    },
  ): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    // Force unwrap is fine as the previous 'if' ensures it is available.
    const summon: Summons | null =
      player.summons.find((item: Summons) => item.id == data.id) ?? null;
    if (summon === null) return false;
    summon.avatarUri = data.avatarUri;
    summon.name = data.name;
    summon.health = data.health;
    summon.totalHealth = data.totalHealth;
    summon.size = data.size;

    return true;
  }

  healSummons(sessionId: string, data: { id: number; heal: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.health += data.heal;

    return true;
  }

  damageSummons(sessionId: string, data: { id: number; damage: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.health -= data.damage;
    if (summon.health < 0) summon.health = 0;

    return true;
  }

  addSummonsDeath(sessionId: string, data: { id: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.deathSaves += 1;
    if (summon.deathSaves > 3) summon.deathSaves = 3;

    return true;
  }
  removeSummonsDeath(sessionId: string, data: { id: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.deathSaves -= 1;
    if (summon.deathSaves < 0) summon.deathSaves = 0;

    return true;
  }

  addSummonsSave(sessionId: string, data: { id: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.lifeSaves += 1;
    if (summon.lifeSaves >= 3) {
      summon.lifeSaves = 0;
      summon.deathSaves = 0;
      summon.health = 1;
    }
    return true;
  }

  removeSummonsSave(sessionId: string, data: { id: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.lifeSaves -= 1;
    if (summon.lifeSaves < 0) summon.lifeSaves = 0;
    return true;
  }

  toggleSummonsVisibility(sessionId: string, data: { id: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.isVisible = !summon.isVisible;

    return true;
  }

  setSummonsStatuses(sessionId: string, data: { statuses: string[]; id: number }): boolean {
    if (this.map === null) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;
    summon.statuses = data.statuses.map((status: string): CharacterStatus => {
      return new CharacterStatus(status);
    });
    return true;
  }

  //#region Fog

  addFog(
    sessionId: string,
    data: { polygon: { lat: number; lng: number }[]; isVisible: boolean; id: string },
  ): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    if (this.map === null) return false;

    // may need to tarnsform object
    this.map.fogs.set(
      data.id,
      new MapFogPolygon(
        data.polygon.map((points: { lat: number; lng: number }): mLatLng => {
          return new mLatLng(points.lat, points.lng);
        }),
        data.isVisible,
        +data.id,
      ),
    );

    return true;
  }
  removeFog(sessionId: string, data: { id: string }): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    if (this.map === null) return false;
    this.map.fogs.delete(data.id);
    return true;
  }

  setFogVisible(sessionId: string, data: { id: string; isVisible: boolean }): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    // if (!this.authenticateAction(player)) return;
    if (this.map === null) return false;

    const obj = this.map.fogs.get(data.id);
    if (obj === undefined) return false;
    obj.isVisible = data.isVisible;
    this.map.fogs.set(data.id, obj);

    return true;
  }
  //#endregion

  //#region IMPORT AND EXPORT
  exportCurrentMapData(): ExportDataInterface | null {
    if (this.map === null) return null;
    const data: ExportDataInterface = {
      map: this.map,
      players: this.players,
    };

    return data;
  }

  // the below load functions should only be called with the data from the database
  loadMapData(map: LoadMapInterface[], initiativeIndex: number, player_size: number) {
    this.RESET_GAME(); // start with a clean slate.
    const data = map[0]; // using the first since there should only be one element
    this.map = new MapData(
      {
        mapBase64: data.image_name,
        width: data.width,
        height: data.height,
        iconHeight: player_size,
        fogs: new MapSchema<MapFogPolygon>({}),
        enemy: new MapSchema<Enemy>({}),
        initiativeIndex: initiativeIndex,
      },
      data.id!,
    );

    // Offset players positions in the beginning to make sure they are not overlapping.
    // if there player is part of the save, they will be set on a follow up method.
    let index: number = 0;
    this.players.forEach((player: Player): void => {
      player.position = new mLatLng(0, player_size * index);
      index++;
    });
  }

  loadPlayerData(players: LoadPlayerInterface[]) {
    this.lastSavedPlayerContext = players;
    players.forEach((val: LoadPlayerInterface) => {
      if (!this.players.has(val.player_id)) {
        // It may be the case where a player joins late
        return;
      }
      const player: Player = this.players.get(val.player_id)!;

      player.position = new mLatLng(val.position_lat, val.position_lng);
      player.initiative = val.initiative;
      player.statuses = val.statuses.map((status: string): CharacterStatus => {
        return new CharacterStatus(status as Conditions);
      });
    });
  }

  loadSummonsData(summons: LoadSummonsInterface[]): void {
    this.lastSavedSummonsContext = summons;
    summons.forEach((val: LoadSummonsInterface): void => {
      if (!this.players.has(val.player_id)) {
        return;
      }
      const currentPlayer: Player = this.players.get(val.player_id)!;
      const summon: Summons = new Summons({
        id: val.summons_id,
        player_id: currentPlayer.userId,
        avatarUri: val.image_name,
        name: val.name,
        size: val.size,
        color: currentPlayer.color,
      });
      summon.position = new mLatLng(val.position_lat, val.position_lng);
      summon.health = val.health;
      summon.totalHealth = val.total_health;
      summon.lifeSaves = val.life_saves;
      summon.deathSaves = val.death_saves;
      summon.isVisible = val.is_visible;
      currentPlayer.summons = [...currentPlayer.summons, summon];
      summon.statuses = val.statuses.map((status: string): CharacterStatus => {
        return new CharacterStatus(status as Conditions);
      });
    });
  }

  loadEnemyData(enemies: LoadEnemyInterface[]) {
    if (this.map === null) return; // this should not be null just checking to satisfy ts
    enemies.forEach((enemy) => {
      const insertEnemy: Enemy = new Enemy({
        avatarUri: enemy.image_name,
        id: enemy.enemy_id,
        name: enemy.name,
        size: enemy.size,
      });

      insertEnemy.position = new mLatLng(enemy.position_lat, enemy.position_lng);
      insertEnemy.initiative = enemy.initiative;
      insertEnemy.health = enemy.health;
      insertEnemy.totalHealth = enemy.total_health;
      insertEnemy.deathSaves = enemy.death_saves;
      insertEnemy.lifeSaves = enemy.life_saves;
      insertEnemy.isVisible = enemy.is_visible;
      insertEnemy.statuses = enemy.statuses.map((status: string): CharacterStatus => {
        return new CharacterStatus(status as Conditions);
      });

      this.map!.enemy.set(`${enemy.enemy_id}`, insertEnemy);
    });
  }

  loadFogData(fogs: LoadFogInterface[]) {
    if (this.map === undefined) return;
    const regex = /\((\d+\.\d+),(\d+\.\d+)\)/gm;

    fogs.forEach((fog) => {
      // conver the polygon to a usable object
      const poly: mLatLng[] = [];
      [...fog.polygon.matchAll(regex)].forEach((val) => {
        const point = new mLatLng(+val[1], +val[2]);
        poly.push(point);
      });
      this.map!.fogs.set(fog.fog_id + "", new MapFogPolygon(poly, fog.visible, fog.fog_id));
    });
  }

  //#endregion

  //#endregion
}
