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
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type(MapData)
  map: MapData | undefined = undefined;

  @type("number")
  gameState: GameStateEnum = GameStateEnum.MAINMENU;

  @type({ map: "string" })
  sessionToUserId = new MapSchema<string>();

  @type("string")
  mapMovement: MapMovementType = "free";

  @type("boolean")
  gridShowing: boolean = true;

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

    // I could reset the map here but that should be handled when the room is disposed.
    //this.map = undefined;
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
    this.players.set(playerOptions.userId, new Player({ ...playerOptions, sessionId }));
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
  updatePosition(sessionId: string, position: { pos: mLatLng; clientToChange: string }): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    const player = this._getPlayerBySessionId(sessionId);
    const playerToMove = this._getPlayerByUserId(position.clientToChange);
    if (player === undefined || playerToMove === undefined) return false; // Player does not exist

    // good to go move the position
    playerToMove.position = new mLatLng(position.pos.lat, position.pos.lng);
    playerToMove.toPosition = [new mLatLng(position.pos.lat, position.pos.lng)]; // Player is replacing the ghost character.
    return true;
  }

  setPlayerGhostPosition(
    sessionId: string,
    position: { pos: mLatLng[]; clientToChange: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    const player = this._getPlayerBySessionId(sessionId);
    const playerToMove = this._getPlayerByUserId(position.clientToChange);
    if (player === undefined || playerToMove === undefined) return false; // Player does not exist

    // good to go! move ghost to the position.
    playerToMove.toPosition = position.pos.map((val: mLatLng) => {
      return new mLatLng(val.lat, val.lng);
    });
    return true;
  }

  updateEnemyPosition(
    sessionId: string,
    position: { pos: mLatLng; clientToChange: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    if (this.map === undefined) return false;
    const player = this._getPlayerBySessionId(sessionId);
    const enemyToMove = this.map.enemy.get(position.clientToChange);

    if (player === undefined || enemyToMove === undefined) return false; // Player does not exist

    enemyToMove.position = new mLatLng(position.pos.lat, position.pos.lng);
    enemyToMove.toPosition = [new mLatLng(position.pos.lat, position.pos.lng)];
    return true;
  }
  setEnemyGhostPosition(
    sessionId: string,
    position: { pos: mLatLng[]; clientToChange: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    if (this.map === undefined) return false;
    const player = this._getPlayerBySessionId(sessionId);
    const enemyToMove = this.map.enemy.get(position.clientToChange);

    if (player === undefined || enemyToMove === undefined) return false; // Player does not exist

    enemyToMove.toPosition = position.pos.map((val: mLatLng) => {
      return new mLatLng(val.lat, val.lng);
    });
    return true;
  }

  //#endregion

  //#region Drawings
  addDrawing(sessionId: string, data: mLatLng[]): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    player.drawings = data.map((val) => {
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
  addCube(sessionId: string, data: { center: mLatLng; radius: number }): boolean {
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
    player.cubeDrawing = undefined;
    return true;
  }
  //#endregion
  //#region Circle
  addCircle(sessionId: string, data: { center: mLatLng; radius: number }): boolean {
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
    player.circleDrawing = undefined;
    return true;
  }
  //#endregion
  //#region Arc
  addArc(
    sessionId: string,
    data: { center: mLatLng; toLocation: mLatLng; angle: number },
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
    player.arcDrawing = undefined;
    return true;
  }
  //#endregion
  //#region Beam
  addBeam(sessionId: string, data: { start: mLatLng; end: mLatLng; width: number }): boolean {
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
    player.beamDrawing = undefined;
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
  setMap(sessionId: string, data: MapData): boolean {
    this.map = new MapData(
      {
        mapBase64: data.mapBase64,
        width: +data.width,
        height: +data.height,
        iconHeight: +data.iconHeight,
        fogs: new MapSchema<MapFogPolygon>({}),
        enemy: new MapSchema<Enemy>({}),
        initiativeIndex: +(data.initiativeIndex ?? 0),
      },
      data.id,
    );

    this.players.forEach((player: Player): void => {
      player.summons = [];
    });
    return false;
  }

  clearMap(sessionId: string): boolean {
    this.map = undefined;
    return true;
  }

  setMapMovement(mapMovement: MapMovementType): boolean {
    this.mapMovement = mapMovement;
    return true;
  }

  setPlayerSize(sessionId: string, data: { size: number }): boolean {
    if (this.map === undefined) return false;
    this.map.iconHeight = data.size;
    return true;
  }

  nextInitiative(): boolean {
    if (this.map === undefined) return false;

    const nInit = this.map.initiativeIndex + 1;
    const initSize = this.players.size + this.map.enemy.size;
    this.map.initiativeIndex = nInit % initSize;

    return true;
  }

  resetInitiativeIndex(): boolean {
    if (this.map === undefined) return false;
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
      position: mLatLng;
      size: number;
      health: number;
      totalHealth: number;
      deathSaves: number;
      lifeSaves: number;
    },
  ): boolean {
    if (this.map === undefined) return false;
    this.map.enemy.set(
      `${data.id}`,
      new Enemy({
        id: data.id,
        avatarUri: data.avatarUri,
        name: data.name,
        position: new mLatLng(data.position.lat, data.position.lng),
        size: data.size,
        initiative: 0,
        health: data.health,
        totalHealth: data.totalHealth,
        deathSaves: data.deathSaves,
        lifeSaves: data.lifeSaves,
        isVisible: true,
      }),
    );
    return true;
  }
  removeEnemy(sessionId: string, data: { id: string }): boolean {
    if (this.map === undefined) return false;
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
    if (this.map === undefined) return false;
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
    if (this.map === undefined) return false;
    const enemy = this.map.enemy.get(data.id);
    if (enemy === undefined) return false;

    enemy.initiative = data.initiative;
    return true;
  }

  healEnemy(sessionId: string, data: { clientToChange: string; heal: number }): boolean {
    if (this.map === undefined) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.health += Math.abs(data.heal);

    return true;
  }
  damageEnemy(sessionId: string, data: { clientToChange: string; damage: number }): boolean {
    if (this.map === undefined) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.health -= Math.abs(data.damage);
    if (player.health <= 0) {
      player.health = 0;
    }

    return true;
  }
  addEnemyDeath(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === undefined) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.deathSaves += 1;
    if (player.deathSaves > 3) player.deathSaves = 3;
    return true;
  }
  removeEnemyDeath(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === undefined) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.deathSaves -= 1;
    if (player.deathSaves < 0) player.deathSaves = 0;

    return true;
  }
  addEnemySave(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === undefined) return false;
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
    if (this.map === undefined) return false;
    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.lifeSaves -= 1;
    if (player.lifeSaves < 0) player.lifeSaves = 0;

    return true;
  }
  toggleEnemyVisibility(sessionId: string, data: { clientToChange: string }): boolean {
    if (this.map === undefined) return false;

    const player = this.map.enemy.get(`${data.clientToChange}`);
    if (player === undefined) return false;
    player.isVisible = !player.isVisible;
    return true;
  }

  //#endregion

  //#region Summons
  updateSummonPosition(
    sessionId: string,
    data: { pos: mLatLng; id: number; player_id: string },
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
    data: { pos: mLatLng[]; id: number; player_id: string },
  ): boolean {
    // I need to make some checks that the person moving this object is the right person or the host.
    const player: Player | null = this._getPlayerByUserId(data.player_id) ?? null;

    if (player === null) return false; // Player does not exist
    const summon: Summons | null =
      player.summons.find((val: Summons) => val.id === data.id) ?? null;
    if (summon === null) return false;

    summon.toPosition = data.pos.map((val: mLatLng) => {
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
      position: mLatLng;
      size: number;
      health: number;
      totalHealth: number;
      deathSaves: number;
      lifeSaves: number;
    },
  ): boolean {
    if (this.map === undefined) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const insertSummon: Summons = new Summons({
      id: data.id,
      avatarUri: data.avatarUri,
      name: data.name,
      position: new mLatLng(data.position.lat, data.position.lng),
      health: data.health,
      totalHealth: data.totalHealth,
      size: data.size,
      color: player.color,
      player_id: player.userId,
      lifeSaves: data.lifeSaves,
      deathSaves: data.deathSaves,
      isVisible: true,
    });
    console.log("inserting summon");

    player.summons = [...player.summons, insertSummon];
    return true;
  }

  removeSummon(sessionId: string, data: { id: number }): boolean {
    if (this.map === undefined) return false;

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
    if (this.map === undefined) return false;

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
    if (this.map === undefined) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.health += data.heal;

    return true;
  }

  damageSummons(sessionId: string, data: { id: number; damage: number }): boolean {
    if (this.map === undefined) return false;

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
    if (this.map === undefined) return false;

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
    if (this.map === undefined) return false;

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
    if (this.map === undefined) return false;

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
    if (this.map === undefined) return false;

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
    if (this.map === undefined) return false;

    const player: Player | undefined = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;

    const summon: Summons | null =
      player.summons.find((item: Summons): boolean => item.id === data.id) ?? null;
    if (summon === null) return false;

    summon.isVisible = !summon.isVisible;

    return true;
  }

  //#region Fog

  //     this.players.set(playerOptions.userId, new Player({ ...playerOptions, sessionId }));

  addFog(sessionId: string, data: { polygon: mLatLng[]; isVisible: boolean; id: string }): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    if (this.map === undefined) return false;

    // may need to tarnsform object
    this.map.fogs.set(
      data.id,
      new MapFogPolygon(
        data.polygon.map((points) => {
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
    // if (!this.authenticateAction(player)) return;
    if (this.map === undefined) return false;
    this.map.fogs.delete(data.id);
    return true;
  }

  setFogVisible(sessionId: string, data: { id: string; isVisible: boolean }): boolean {
    const player = this._getPlayerBySessionId(sessionId);
    if (player === undefined) return false;
    // if (!this.authenticateAction(player)) return;
    if (this.map === undefined) return false;

    const obj = this.map.fogs.get(data.id);
    if (obj === undefined) return false;
    obj.isVisible = data.isVisible;
    this.map.fogs.set(data.id, obj);

    return true;
  }
  //#endregion

  //#region IMPORT AND EXPORT
  exportCurrentMapData(): ExportDataInterface | undefined {
    if (this.map === undefined) return undefined;
    const data: ExportDataInterface = {
      map: this.map,
      players: this.players,
    };

    return data;
  }

  // the below load functions should only be called with the data from the database
  loadMapData(map: LoadMapInterface[], initiativeIndex: number, player_size: number) {
    const data = map[0]; // using the first since there should only be one element
    this.map = new MapData(
      {
        mapBase64: data.image_name,
        width: +data.width,
        height: +data.height,
        iconHeight: player_size,
        fogs: new MapSchema<MapFogPolygon>({}),
        enemy: new MapSchema<Enemy>({}),
        initiativeIndex: initiativeIndex,
      },
      +data.id!,
    );
  }

  loadPlayerData(players: LoadPlayerInterface[]) {
    players.forEach((val) => {
      if (!this.players.has(val.player_id)) {
        // TODO: Set this, no reason to not estimate the player if they were here before.
        return;
      }

      this.players.get(val.player_id)!.position = new mLatLng(val.position_lat, val.position_lng);
      this.players.get(val.player_id)!.initiative = +val.initiative;
    });
  }

  loadEnemyData(enemies: LoadEnemyInterface[]) {
    if (this.map === undefined) return; // this should not be null just checking to satisfy ts
    enemies.forEach((enemy) => {
      this.map!.enemy.set(
        enemy.enemy_id + "",
        new Enemy({
          avatarUri: enemy.image_name,
          id: +enemy.enemy_id,
          name: enemy.name,
          position: new mLatLng(enemy.position_lat, enemy.position_lng),
          size: +enemy.size,
          initiative: +enemy.initiative,
          health: +enemy.health,
          totalHealth: +enemy.total_health,
          deathSaves: +enemy.death_saves,
          lifeSaves: +enemy.life_saves,
          isVisible: enemy.is_visible,
        }),
      );
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
      this.map!.fogs.set(fog.fog_id + "", new MapFogPolygon(poly, fog.visible, +fog.fog_id));
    });
  }

  loadSummonsData(summons: LoadSummonsInterface[]): void {
    // Reset or instantiate summons
    this.players.forEach((player: Player): void => {
      player.summons = [];
    });
    summons.forEach((val: LoadSummonsInterface): void => {
      if (!this.players.has(val.player_id)) {
        console.log("Not the right player");
        return;
      }
      const currentPlayer: Player = this.players.get(val.player_id)!;
      const summon: Summons = new Summons({
        avatarUri: val.image_name,
        id: +val.summons_id,
        name: val.name,
        position: new mLatLng(val.position_lat, val.position_lng),
        size: +val.size,
        color: currentPlayer.color,
        player_id: currentPlayer.userId,
        health: +val.health,
        totalHealth: +val.total_health,
        lifeSaves: +val.life_saves,
        deathSaves: +val.death_saves,
        isVisible: val.is_visible,
      });
      currentPlayer.summons = [...currentPlayer.summons, summon];
    });
  }
  //#endregion

  //#endregion
}
