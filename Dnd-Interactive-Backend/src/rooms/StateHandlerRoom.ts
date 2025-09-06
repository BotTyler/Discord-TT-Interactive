import { Client, Room } from "colyseus";
import * as crypto from "crypto";
import { ExportDataInterface } from "../shared/ExportDataInterface";
import { GameStateEnum, IState, MapMovementType, State} from "../shared/State";
import { LoadCampaign, LoadImage, LoadSaveHistory} from "../shared/LoadDataInterfaces";
import { AudioCatalogDAO, AudioCatalogDB } from "../Database/Tables/AudioCatalogDB";
import { EnemyDAO, EnemyDB } from "../Database/Tables/EnemyDB";
import {
  EnemyMovementHistoryDAO,
  EnemyMovementHistoryDB,
} from "../Database/Tables/EnemyMovementHistoryDB";
import { FogDAO, FogDB } from "../Database/Tables/FogDB";
import { FogStateHistoryDAO, FogStateHistoryDB } from "../Database/Tables/FogStateHistoryDB";
import { ImageCatalogDAO, ImageCatalogDB } from "../Database/Tables/ImageCatalogDB";
import { InitiativeHistoryDAO, InitiativeHistoryDB } from "../Database/Tables/InitiativeHistoryDB";
import { MapDAO, MapDB } from "../Database/Tables/MapDB";
import { PlayerDAO, PlayerDB } from "../Database/Tables/PlayerDB";
import {
  PlayerMovementHistoryDAO,
  PlayerMovementHistoryDB,
} from "../Database/Tables/PlayerMovementHistoryDB";
import { SaveHistoryDAO, SaveHistoryDB } from "../Database/Tables/SaveHistoryDB";
import { sanitize, ValidateAllInputs, ValidationInputType } from "../Util/Utils";

export class StateHandlerRoom extends Room<State> {
  maxClients = 1000;

  onCreate(options: IState) {
    this.setState(new State(options));

    // MESSAGES
    this.onMessage("BroadcastMessage", (client, data) => {
      // input validation
      try {
        const checkMessageType = (val: string) => {
          if (val !== "player" && val !== "all" && val !== "host") {
            throw new Error("Message Type is Invalid!!");
          }
          return val;
        };
        const inputList: ValidationInputType[] = [
          { name: "message", PostProcess: sanitize, type: "string" },
          { name: "type", PostProcess: checkMessageType, type: "string" },
        ];
        const validateParams: any = ValidateAllInputs(data, inputList);

        // validation complete lets send the message to all the clients
        const player = this.state._getPlayerBySessionId(client.sessionId);
        if (!player) return;

        const sendData = {
          created: new Date(),
          displayName: player.name,
          userId: player.userId,
          message: validateParams.message,
          type: validateParams.type,
        };

        switch (validateParams.type) {
          case "player":
            this.broadcast("PlayerMessageAdd", { message: sendData });
            break;
          case "host":
            this.broadcast("HostMessageAdd", { message: sendData });
            break;
          case "all":
            this.broadcast("AllMessageAdd", { message: sendData });
            break;
        }
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("BroadcastHandout", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "playerIds", PostProcess: undefined, type: "array" },
          { name: "imageUrl", PostProcess: undefined, type: "string" },
        ];
        const validateParams: any = ValidateAllInputs(data, inputList);

        validateParams.playerIds.forEach((x: string) => {
          // we need to grab the player
          console.log(x);
          const player = this.state._getPlayerByUserId(x);
          if (!player) {
            console.error("Player not found");
            return;
          }
          const client = this.clients.getById(player.sessionId);
          if (!client) {
            console.error("Client Not Found");
            return;
          }

          console.log("BroadCasting Handout");
          // client is ready to receive request
          client.send("HandoutAdd", { id: crypto.randomUUID(), imageUrl: validateParams.imageUrl });
        });
      } catch (error) {
        console.error(error);
      }
    });

    // PLAYER MOVEMENT
    this.onMessage("updatePosition", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "pos", type: "object", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];
        const validateParams: any = ValidateAllInputs(data, inputList);

        if (!this.softAuthenticate(client.sessionId, validateParams.clientToChange)) {
          client.send(`MovementConfirmation${validateParams.clientToChange}`, false);
          return;
        }

        const status = this.state.updatePosition(client.sessionId, validateParams);
        client.send(`MovementConfirmation${data.clientToChange}`, status);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("updatePlayerGhostPosition", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "pos", type: "object", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];
        const validateParams: any = ValidateAllInputs(data, inputList);

        if (!this.softAuthenticate(client.sessionId, validateParams.clientToChange)) {
          client.send(`PlayerGhostMovementConfirmation${validateParams.clientToChange}`, false);
          return;
        }

        const status = this.state.updatePosition(client.sessionId, validateParams);
        client.send(`PlayerGhostMovementConfirmation${data.clientToChange}`, status);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("updateEnemyPosition", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "pos", type: "object", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        if (!this.authenticateHostAction(client.sessionId)) {
          client.send(`EnemyMovementConfirmation${validateParams.clientToChange}`, false);
          return;
        }

        const status = this.state.updateEnemyPosition(client.sessionId, validateParams);
        client.send(`EnemyMovementConfirmation${validateParams.clientToChange}`, status);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("changePlayerColor", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "color", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.changePlayerColor(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("changeInitiative", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "initiative", type: "number", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.changePlayerInitiative(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("changePlayerTotalHp", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "totalHp", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // do not need to soft auth since this method should be used to change the player that is requesting.
        this.state.changePlayerTotalHp(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("changePlayerHp", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "hp", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // do not need to soft auth since this method should be used to change the player that is requesting.
        this.state.changePlayerHp(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("playerHeal", (client, data) => {
      if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "heal", type: "number", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.healPlayer(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("playerDamage", (client, data) => {
      if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "damage", type: "number", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.damagePlayer(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("playerDeathAdd", (client, data) => {
      if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addPlayerDeath(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("playerDeathRemove", (client, data) => {
      if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.removePlayerDeath(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("playerSaveAdd", (client, data) => {
      if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addPlayerSave(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("playerSaveRemove", (client, data) => {
      if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.removePlayerSave(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    // HOST
    this.onMessage("setHost", (client, _data) => {
      this.state.setHost(client.sessionId);
    });

    this.onMessage("removeHost", (client, _data) => {
      this.state.removeHost(client.sessionId);
    });

    // GAME STATES
    this.onMessage("setGameState", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "gameState", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.setGameState(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("setPlayerSize", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "size", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.setPlayerSize(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    // DRAWINGS
    this.onMessage("addDrawings", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "points", type: "array", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addDrawing(client.sessionId, validateParams.points);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("removeDrawing", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "playerId", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.removeDrawing(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("clearDrawings", (client, _data) => {
      this.state.clearDrawings(client.sessionId);
    });

    // Cube Drawings
    this.onMessage("addCube", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "center", type: "object", PostProcess: undefined },
          { name: "radius", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addCube(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("removeCube", (client, _data) => {
      this.state.removeCube(client.sessionId);
    });

    // Circle Drawings
    this.onMessage("addCircle", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "center", type: "object", PostProcess: undefined },
          { name: "radius", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addCircle(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("removeCircle", (client, _data) => {
      this.state.removeCircle(client.sessionId);
    });

    // Arc Drawings
    this.onMessage("addArc", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "center", type: "object", PostProcess: undefined },
          { name: "toLocation", type: "object", PostProcess: undefined },
          { name: "angle", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addArc(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("removeArc", (client, _data) => {
      this.state.removeArc(client.sessionId);
    });

    // FOG
    this.onMessage("addFog", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "polygon", type: "array", PostProcess: undefined },
          { name: "isVisible", type: "boolean", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        FogDB.getInstance()
          .create(new FogDAO(validateParams.polygon))
          .then((index) => {
            validateParams.id = index;
            this.state.addFog(client.sessionId, validateParams);
          });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("removeFog", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.removeFog(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("setFogVisible", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "string", PostProcess: undefined },
          { name: "isVisible", type: "boolean", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.setFogVisible(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    // Enemy
    this.onMessage("addEnemy", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "name", type: "string", PostProcess: undefined },
          { name: "avatarUri", type: "string", PostProcess: undefined },
          { name: "position", type: "object", PostProcess: undefined },
          { name: "size", type: "number", PostProcess: undefined },
          { name: "totalHealth", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        const player = this.state._getPlayerBySessionId(client.sessionId);
        if (player === undefined) return;
        // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
        ImageCatalogDB.getInstance()
          // .create(new ImageCatalogDAO(player.userId, data.avatarUri, data.imgWidth, data.imgHeight))
          .selectByImageName(validateParams.avatarUri)
          .then((value) => {
            if (value === undefined) return;
            EnemyDB.getInstance()
              .create(new EnemyDAO(value.img_catalog_id!, validateParams.name))
              .then((id) => {
                if (id === undefined) return;
                validateParams.id = +id;
                const mData: any = {
                  id: +id,
                  avatarUri: value.image_name,
                  name: validateParams.name,
                  position: validateParams.position,
                  size: validateParams.size,
                  initiative: 0,
                  totalHealth: validateParams.totalHealth,
                  health: validateParams.totalHealth,
                };
                this.state.addEnemy(client.sessionId, mData);
              })
              .catch((e) => {});
          });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("deleteEnemy", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.removeEnemy(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("updateEnemy", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "string", PostProcess: undefined },
          { name: "name", type: "string", PostProcess: undefined },
          { name: "avatarUri", type: "string", PostProcess: undefined },
          { name: "size", type: "number", PostProcess: undefined },
          { name: "totalHealth", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.updateEnemyInformation(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("changeEnemyInitiative", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "string", PostProcess: undefined },
          { name: "initiative", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.updateEnemyInitiative(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("enemyHeal", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "heal", type: "number", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.healEnemy(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("enemyDamage", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "damage", type: "number", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.damageEnemy(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("enemyDeathAdd", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addEnemyDeath(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("enemyDeathRemove", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.removeEnemyDeath(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("enemySaveAdd", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addEnemySave(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("enemySaveRemove", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.removeEnemySave(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    // EXPORT and IMPORT

    // sets a new map
    this.onMessage("setGameMap", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "mapBase64", type: "string", PostProcess: undefined },
          { name: "iconHeight", type: "number", PostProcess: undefined },
          { name: "name", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        const player = this.state._getPlayerBySessionId(client.sessionId);
        if (player === undefined) return;

        ImageCatalogDB.getInstance()
          .selectByImageName(validateParams.mapBase64)
          .then((value) => {
            if (value === undefined) return;
            MapDB.getInstance()
              .create(
                new MapDAO(
                  value.img_catalog_id!,
                  validateParams.iconHeight,
                  validateParams.name,
                  player.userId,
                ),
              )
              .then((index) => {
                const mData: any = {
                  id: index,
                  mapBase64: value.image_name,
                  width: value.width,
                  height: value.height,
                  iconHeight: validateParams.iconHeight,
                  initiativeIndex: 0,
                };
                // create atleast one save for the future
                SaveHistoryDB.getInstance().create(
                  new SaveHistoryDAO(new Date(), mData.id, player.userId),
                );
                this.state.setMap(client.sessionId, mData);
                this.state.gameState = GameStateEnum.HOSTPLAY;
              });
          });
      } catch (error) {
        console.error(error);
      }
    });

    // saves the map to the database
    this.onMessage("exportMap", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;

      const data: ExportDataInterface | undefined = this.state.exportCurrentMapData();
      // save this data to the database

      if (data === undefined) {
        client.send("exportData", new Error("Data was not saved!!"));
        return;
      }

      const player_id = this.state._getPlayerBySessionId(client.sessionId);
      if (player_id === undefined) return; // this data cannot be inserted into the table
      // TODO: This should be transformed into a transaction on the database side for now this is ok for test purposes.
      SaveHistoryDB.getInstance()
        .create(new SaveHistoryDAO(new Date(), data.map.id!, player_id.userId))
        .then((index) => {
          if (index === undefined) return; // required data is not inserted in the database we need to leave.
          //we have the save history index we now need to insert into all other databases

          // Create a checkpoint for all players in the player_movement_history DB
          [...data.players.keys()].forEach((key) => {
            const p = data.players.get(key)!;
            const position = p.position;
            const initiative = p.initiative;
            const health = p.health;
            const totalHealth = p.totalHealth;
            const deathSaves = p.deathSaves;
            const lifeSaves = p.lifeSaves;
            PlayerMovementHistoryDB.getInstance().create(
              new PlayerMovementHistoryDAO(
                index,
                key,
                position,
                initiative,
                health,
                totalHealth,
                deathSaves,
                lifeSaves,
              ),
            );
          });

          // Create a checkpoint for all enemies
          [...data.map.enemy.keys()].forEach((key) => {
            const e = data.map.enemy.get(key)!;
            const position = e.position;
            const size = e.size;
            const initiaitive = e.initiative;
            const health = e.health;
            const totalHealth = e.totalHealth;
            const deathSaves = e.deathSaves;
            const lifeSaves = e.lifeSaves;
            EnemyMovementHistoryDB.getInstance().create(
              new EnemyMovementHistoryDAO(
                index,
                +key,
                size,
                position,
                initiaitive,
                health,
                totalHealth,
                deathSaves,
                lifeSaves,
              ),
            );
          });

          // Time for fogs
          [...data.map.fogs.keys()].forEach((key) => {
            const visible = data.map.fogs.get(key)!.isVisible;
            FogStateHistoryDB.getInstance().create(new FogStateHistoryDAO(index, +key, visible));
          });

          InitiativeHistoryDB.getInstance().create(
            new InitiativeHistoryDAO(index, data.map.initiativeIndex),
          );
        });

      // client.send("FileExport", data);
    });

    this.onMessage("clearMap", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;

      this.state.clearMap(client.sessionId);
    });

    this.onMessage("SetMapMovementType", (client, data) => {
      // input validation
      try {
        if(!this.authenticateHostAction(client.sessionId)) return;
        const inputList: ValidationInputType[] = [
          { name: "mapMovement", PostProcess: (val: string): MapMovementType => {
            switch(val){
              case "free":
                return "free";
              case "grid":
                return "grid";
              default:
                return "free";
            }
          }, type: "string" },
        ];
        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.setMapMovement(validateParams.mapMovement);

      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("nextInitiativeIndex", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;

      this.state.nextInitiative();
    });
    this.onMessage("resetInitiativeIndex", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;

      this.state.resetInitiativeIndex();
    });

    // this will get all saves from a specific user and return those to the client that called
    this.onMessage("getSaves", (client, _data) => {
      SaveHistoryDB.getInstance()
        .selectById(_data.user_id)
        .then((value: SaveHistoryDAO[] | undefined) => {
          const sendData: LoadSaveHistory[] | undefined = value?.map((val) => {
            return { id: val.id ?? -1, date: val.date, map: val.map };
          });
          client.send("getSavesResult", sendData ?? []);
        });
    });

    /**
UPDATE Public."Map" AS mp
SET player_id = sh.player_id
FROM Public."Save_History" AS sh
WHERE sh.map = mp.id;
     */
    /*
delete from Public."Map" where player_id = 'temp';
    */
    this.onMessage("getCampaigns", (client, _data) => {
      const player = this.state._getPlayerBySessionId(client.sessionId);
      if (!player) return client.error(666, "You are not Connected");
      MapDB.getInstance()
        .selectMapByUserId(player?.userId)
        .then((value: LoadCampaign[] | undefined) => {
          const sendData: LoadCampaign[] | undefined = value?.map((val) => {
            return {
              id: val.id,
              image_name: val.image_name,
              name: val.name,
              height: val.height,
              width: val.width,
            };
          });

          client.send("CampaignResult", sendData ?? []);
        });
    });

    this.onMessage("getVersionsByCampaign", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "campaign_id", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        SaveHistoryDB.getInstance()
          .selectByCampaignId(validateParams.campaign_id)
          .then((value: SaveHistoryDAO[] | undefined) => {
            const sendData: LoadSaveHistory[] =
              value?.map((val) => {
                return { id: val.id ?? -1, date: val.date, map: val.map };
              }) ?? [];

            client.send("CampaignVersionHistoryResult", sendData);
          });
      } catch (error) {
        console.error(error);
        client.send("CampaignVersionHistoryResult", []);
      }
    });
    // A method to gather all images submitted by the user that is stored in the minio database.
    // This method will only return the name of the image and should be used in junction with the getImage method to download.
    this.onMessage("getImageList", (client, _data) => {
      const player = this.state._getPlayerBySessionId(client.sessionId);
      if (player === undefined) return;

      ImageCatalogDB.getInstance()
        .selectAllImagesByPlayerId(player.userId)
        .then((value: ImageCatalogDAO[] | undefined) => {
          const sendData: LoadImage[] | undefined = value?.map((val) => {
            return { image_name: val.image_name };
          });
          client.send("getImageListResult", sendData ?? []);
        });
    });

    // A method to gather all audio files that were submitted by the user.
    // This should be used with the appropriate express endpoint to load the file.
    this.onMessage("getAudioList", (client, _data) => {
      const player = this.state._getPlayerBySessionId(client.sessionId);
      if (player === undefined) return;
      AudioCatalogDB.getInstance()
        .selectAllAudioByPlayerId(player.userId)
        .then((value: AudioCatalogDAO[] | undefined) => {
          const strList = value?.map((val: AudioCatalogDAO) => {
            return val.audio_name;
          });
          client.send("getAudioListResult", strList ?? []);
        });
    });

    // Function that will set all the values of a room based on the chosen save
    this.onMessage("loadMap", async (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "map_id", type: "number", PostProcess: undefined },
          { name: "history_id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        const mapPromise = MapDB.getInstance().selectMapById(validateParams.map_id);
        const playerHistoryPromise =
          PlayerMovementHistoryDB.getInstance().getPlayerMovementAtHistoryId(
            validateParams.history_id,
          );
        const enemyHistoryPromise =
          EnemyMovementHistoryDB.getInstance().getEnemyMovementAtHistoryId(
            validateParams.history_id,
          );
        const fogHistoryPromise = FogStateHistoryDB.getInstance().getFogStateAtHistoryId(
          validateParams.history_id,
        );
        const ininitiativePromise = InitiativeHistoryDB.getInstance().selectByHistoryId(
          validateParams.history_id,
        );

        const savedHistoryData = await Promise.all([
          mapPromise,
          playerHistoryPromise,
          enemyHistoryPromise,
          fogHistoryPromise,
          ininitiativePromise,
        ]);

        if (savedHistoryData[0] === undefined) return; // if the map is not present the rest of the data is useless

        const initData = savedHistoryData[4]![0] ?? { history_id: -1, initiative_index: 0 };
        this.state.loadMapData(savedHistoryData[0], +initData.initiative_index);

        this.state.loadPlayerData(savedHistoryData[1] ?? []);
        this.state.loadEnemyData(savedHistoryData[2] ?? []);
        this.state.loadFogData(savedHistoryData[3] ?? []);
      } catch (error) {
        console.error(error);
      }
    });

    // AUDIO
    this.onMessage("ChangeAudio", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "index", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.changeAudio(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("PlayAudio", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      this.state.playVideo(client.sessionId);
    });

    this.onMessage("PauseAudio", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      this.state.pauseVideo(client.sessionId);
    });

    this.onMessage("SetTimestamp", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "timestamp", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.setTimestamp(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("AddAudio", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "audioName", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addToAudioQueue(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("RemoveAudio", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "audioName", type: "string", PostProcess: undefined },
          { name: "index", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.removeFromAudioQueue(client.sessionId, validateParams);
      } catch (error) {
        console.error(error);
      }
    });

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
        { name: "channelId", PostProcess: undefined, type: "string" },
        { name: "roomName", PostProcess: undefined, type: "string" },
        { name: "userId", PostProcess: undefined, type: "string" },
        { name: "name", PostProcess: undefined, type: "string" },
        { name: "avatarUri", PostProcess: undefined, type: "string" },
      ];

      const validateParams: Record<string, any> = ValidateAllInputs(options, inputList);

      // Validation Complete Lets insert into the database and create the player
      PlayerDB.getInstance().create(new PlayerDAO(validateParams.userId, validateParams.name));
      this.state.createPlayer(client.sessionId, options);
    } catch (error) {
      console.error(error);
      client.error(404, `${error}`);
    }
  }

  async onLeave(client: Client, consented: boolean) {
    this.state.setPlayerConnected(client.sessionId, { connection: false });

    try {
      if (consented) {
        console.log("Consent Disconnect!!!");
        throw new Error("Consented Disconnect");
      }
      console.log("waiting for reconnect");
      // 7 because I like the number 7   0.0
      await this.allowReconnection(client, 7);
      console.log("Client Reconnected");
      this.state.setPlayerConnected(client.sessionId, { connection: true });
    } catch (e) {
      console.log("Client Disconnected");
      const player = this.state._getPlayerBySessionId(client.sessionId)!;

      // Since this client disconnected lets make sure they are not the host
      if (!player.isHost) {
        return;
      }
      player.isHost = false; // If the user rejoins, this will need to be reset.
      // Since this is the host we need to panic. 0.o
      this.state.PANIC();
    }
  }

  onDispose() {
    console.log("Dispose StateHandlerRoom");
    this.state.removeAllPlayers();
  }

  //#region Validation
  /**
   * This function will determine if the action taking place is allowed.
   * @param issuer - the player that is calling for a change
   * @param reciever - the player that is recieving the change
   * @returns Boolean to determine if the action is validated
   */
  softAuthenticate(issuer_session_id: string, reciever_id: string): boolean {
    const issuer = this.state._getPlayerBySessionId(issuer_session_id);
    const reciever = this.state._getPlayerByUserId(reciever_id);
    if (issuer === undefined) return false;
    if (reciever === undefined) return false;

    // console.log(this.authenticateHostAction(issuer_session_id));
    // console.log(issuer.userId === reciever.userId);
    return this.authenticateHostAction(issuer_session_id) || issuer.userId === reciever.userId;
  }

  authenticateHostAction(session_id: string) {
    // console.log("start authentication")
    const user = this.state._getPlayerBySessionId(session_id);
    if (user === undefined) return false;
    // console.log("user exist");
    // console.log(this.state.currentHostUserId !== undefined);
    // console.log(user.isHost);
    // console.log(this.state.currentHostUserId === user.userId);
    return (
      this.state.currentHostUserId !== undefined &&
      user.isHost &&
      this.state.currentHostUserId === user.userId
    );
  }

  //#endregion
}
