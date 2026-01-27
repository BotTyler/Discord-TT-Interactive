import { Client, Room } from "colyseus";
import * as crypto from "crypto";
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
import { ExportDataInterface } from "../shared/ExportDataInterface";
import { LoadCampaign, LoadImage, LoadSaveHistory } from "../shared/LoadDataInterfaces";
import { GameStateEnum, IState, MapMovementType, State } from "../shared/State";
import { sanitize, ValidateAllInputs, ValidationInputType } from "../Util/Utils";
import { SummonsDao, SummonsDB } from "../Database/Tables/SummonsDb";
import { SummonsHistoryDao, SummonsHistoryDB } from "../Database/Tables/SummonsHistoryDB";
import { Summons } from "../shared/Summons";
import { mLatLng } from "../shared/PositionInterface";
import { CharacterStatus } from "../shared/StatusTypes";
import { Enemy } from "../shared/Enemy";
import { error } from "console";

export class StateHandlerRoom extends Room<State> {
  maxClients = 1000;

  onCreate(options: IState) {
    this.setState(new State(options));

    // Grid
    this.onMessage("ChangeGridColor", (client, data) => {
      // input validation
      try {
        const inputList: ValidationInputType[] = [
          { name: "gridColor", PostProcess: sanitize, type: "string" },
        ];
        const validateParams: any = ValidateAllInputs(data, inputList);

        // validation complete lets send the message to all the clients
        if (!this.authenticateHostAction(client.sessionId)) return;

        this.state.setGridColor(client.sessionId, validateParams.gridColor);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("GridDisplay", (client, data) => {
      // input validation
      try {
        const inputList: ValidationInputType[] = [
          { name: "gridShowing", PostProcess: undefined, type: "boolean" },
        ];
        const validateParams: any = ValidateAllInputs(data, inputList);

        // validation complete lets send the message to all the clients
        if (!this.authenticateHostAction(client.sessionId)) return;

        this.state.setGridShowing(client.sessionId, validateParams.gridShowing);
      } catch (error) {
        console.error(error);
      }
    });

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
          return;
        }

        const status = this.state.updatePosition(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          lat: +validateParams.pos.lat,
          lng: +validateParams.pos.lng,
        });
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
          return;
        }

        const status = this.state.setPlayerGhostPosition(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          pos: validateParams.pos.map(
            (val: { lat: number; lng: number }): { lat: number; lng: number } => {
              return { lat: +val.lat, lng: +val.lng };
            },
          ),
        });
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
          return;
        }

        const status = this.state.updateEnemyPosition(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          lat: +validateParams.pos.lat,
          lng: +validateParams.pos.lng,
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("updateEnemyGhostPosition", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "pos", type: "object", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        if (!this.authenticateHostAction(client.sessionId)) {
          // client.send(`EnemyGhostMovementConfirmation${validateParams.clientToChange}`, false);
          return;
        }

        const status = this.state.setEnemyGhostPosition(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          pos: validateParams.pos.map(
            (val: { lat: number; lng: number }): { lat: number; lng: number } => {
              return { lat: +val.lat, lng: +val.lng };
            },
          ),
        });
        // client.send(`EnemyGhostMovementConfirmation${validateParams.clientToChange}`, status);
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
        this.state.changePlayerColor(client.sessionId, {
          color: validateParams.color,
        });
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
        this.state.changePlayerInitiative(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          initiative: +validateParams.initiative,
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("setPlayerStatuses", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "statuses", type: "array", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.setPlayerStatuses(client.sessionId, {
          statuses: validateParams.statuses,
        });
      } catch (error) {
        console.error(error);
      }
    });
    // this.onMessage("changePlayerTotalHp", (client, data) => {
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "totalHp", type: "number", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //
    //     // do not need to soft auth since this method should be used to change the player that is requesting.
    //     this.state.changePlayerTotalHp(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
    // this.onMessage("changePlayerHp", (client, data) => {
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "hp", type: "number", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //
    //     // do not need to soft auth since this method should be used to change the player that is requesting.
    //     this.state.changePlayerHp(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
    // this.onMessage("playerHeal", (client, data) => {
    //   if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "heal", type: "number", PostProcess: undefined },
    //       { name: "clientToChange", type: "string", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //     this.state.healPlayer(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
    // this.onMessage("playerDamage", (client, data) => {
    //   if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "damage", type: "number", PostProcess: undefined },
    //       { name: "clientToChange", type: "string", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //     this.state.damagePlayer(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
    //
    // this.onMessage("playerDeathAdd", (client, data) => {
    //   if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "clientToChange", type: "string", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //     this.state.addPlayerDeath(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
    // this.onMessage("playerDeathRemove", (client, data) => {
    //   if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "clientToChange", type: "string", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //     this.state.removePlayerDeath(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
    // this.onMessage("playerSaveAdd", (client, data) => {
    //   if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "clientToChange", type: "string", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //     this.state.addPlayerSave(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
    // this.onMessage("playerSaveRemove", (client, data) => {
    //   if (!this.softAuthenticate(client.sessionId, data.clientToChange)) return;
    //   try {
    //     const inputList: ValidationInputType[] = [
    //       { name: "clientToChange", type: "string", PostProcess: undefined },
    //     ];
    //
    //     const validateParams: any = ValidateAllInputs(data, inputList);
    //     this.state.removePlayerSave(client.sessionId, validateParams);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });

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

        this.state.setGameState(client.sessionId, {
          gameState: +validateParams.gameState,
        });
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

        this.state.setPlayerSize(client.sessionId, {
          size: +validateParams.size,
        });
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
        this.state.addDrawing(
          client.sessionId,
          validateParams.points.map(
            (val: { lat: number; lng: number }): { lat: number; lng: number } => {
              return {
                lat: +val.lat,
                lng: +val.lng,
              };
            },
          ),
        );
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
        this.state.removeDrawing(client.sessionId, {
          playerId: validateParams.playerId,
        });
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
        this.state.addCube(client.sessionId, {
          radius: +validateParams.radius,
          center: {
            lat: +validateParams.center.lat,
            lng: +validateParams.center.lng,
          },
        });
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
        this.state.addCircle(client.sessionId, {
          radius: +validateParams.radius,
          center: {
            lat: +validateParams.center.lat,
            lng: +validateParams.center.lng,
          },
        });
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
        this.state.addArc(client.sessionId, {
          angle: +validateParams.angle,
          toLocation: {
            lat: +validateParams.toLocation.lat,
            lng: +validateParams.toLocation.lng,
          },
          center: {
            lat: +validateParams.center.lat,
            lng: +validateParams.center.lng,
          },
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("removeArc", (client, _data) => {
      this.state.removeBeam(client.sessionId);
    });

    // Beam Drawings
    this.onMessage("addBeam", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "start", type: "object", PostProcess: undefined },
          { name: "end", type: "object", PostProcess: undefined },
          { name: "width", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        this.state.addBeam(client.sessionId, {
          width: +validateParams.width,
          start: {
            lat: +validateParams.start.lat,
            lng: +validateParams.start.lng,
          },
          end: {
            lat: +validateParams.start.lat,
            lng: +validateParams.start.lng,
          },
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("removeBeam", (client, _data) => {
      this.state.removeCircle(client.sessionId);
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
          .then((index: number | null) => {
            if (index === null) return;
            this.state.addFog(client.sessionId, {
              id: `${index}`,
              isVisible: validateParams.isVisible,
              polygon: validateParams.polygon.map(
                (val: { lat: number; lng: number }): { lat: number; lng: number } => {
                  return {
                    lat: +val.lat,
                    lng: +val.lng,
                  };
                },
              ),
            });
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

        this.state.removeFog(client.sessionId, {
          id: validateParams.id,
        });
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

        this.state.setFogVisible(client.sessionId, {
          id: validateParams.id,
          isVisible: validateParams.isVisible,
        });
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
          .then((value: ImageCatalogDAO | null): void => {
            if (value === null) return;
            EnemyDB.getInstance()
              .create(new EnemyDAO(value.img_catalog_id!, validateParams.name))
              .then((id: number | null) => {
                if (id === null) return;
                validateParams.id = +id;
                this.state.addEnemy(client.sessionId, {
                  id: +id,
                  avatarUri: value.image_name,
                  name: validateParams.name,
                  position: {
                    lat: +validateParams.position.lat,
                    lng: +validateParams.position.lng,
                  },
                  size: +validateParams.size,
                  health: +validateParams.totalHealth,
                  totalHealth: +validateParams.totalHealth,
                });
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

        this.state.removeEnemy(client.sessionId, {
          id: validateParams.id,
        });
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
          { name: "health", type: "number", PostProcess: undefined },
          { name: "totalHealth", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
        ImageCatalogDB.getInstance()
          // .create(new ImageCatalogDAO(player.userId, data.avatarUri, data.imgWidth, data.imgHeight))
          .selectByImageName(validateParams.avatarUri)
          .then((imageCatalog: ImageCatalogDAO | null) => {
            if (imageCatalog === null) return;
            EnemyDB.getInstance()
              .selectById(+validateParams.id)
              .then((enemy: EnemyDAO | null) => {
                if (enemy === null) return;
                enemy.image_id = imageCatalog.img_catalog_id!;
                enemy.name = validateParams.name;

                // NGL this many encased db calls is bad.
                EnemyDB.getInstance().update(enemy);

                this.state.updateEnemyInformation(client.sessionId, {
                  id: validateParams.id,
                  name: validateParams.name,
                  size: +validateParams.size,
                  avatarUri: imageCatalog.image_name,
                  health: +validateParams.health,
                  totalHealth: +validateParams.totalHealth,
                });
              })
              .catch((e) => {
                console.error(e);
              });
          });
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
        this.state.updateEnemyInitiative(client.sessionId, {
          id: validateParams.id,
          initiative: +validateParams.initiative,
        });
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
        this.state.healEnemy(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          heal: +validateParams.heal,
        });
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
        this.state.damageEnemy(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          damage: +validateParams.damage,
        });
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
        this.state.addEnemyDeath(client.sessionId, {
          clientToChange: validateParams.clientToChange,
        });
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
        this.state.removeEnemyDeath(client.sessionId, {
          clientToChange: validateParams.clientToChange,
        });
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
        this.state.addEnemySave(client.sessionId, {
          clientToChange: validateParams.clientToChange,
        });
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
        this.state.removeEnemySave(client.sessionId, {
          clientToChange: validateParams.clientToChange,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("toggleEnemyVisibility", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.toggleEnemyVisibility(client.sessionId, {
          clientToChange: validateParams.clientToChange,
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("setEnemyStatuses", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "statuses", type: "array", PostProcess: undefined },
          { name: "clientToChange", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        this.state.setEnemyStatuses(client.sessionId, {
          clientToChange: validateParams.clientToChange,
          statuses: validateParams.statuses,
        });
      } catch (error) {
        console.error(error);
      }
    });

    // Summons
    this.onMessage("updateSummonsPosition", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "pos", type: "object", PostProcess: undefined },
          { name: "id", type: "number", PostProcess: undefined },
          { name: "player_id", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        if (!this.softAuthenticate(client.sessionId, validateParams.player_id)) {
          return;
        }

        const status = this.state.updateSummonPosition(client.sessionId, {
          id: validateParams.id,
          player_id: validateParams.player_id,
          pos: {
            lat: validateParams.pos.lat,
            lng: validateParams.pos.lng,
          },
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("updateSummonsGhostPosition", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "pos", type: "array", PostProcess: undefined },
          { name: "id", type: "number", PostProcess: undefined },
          { name: "player_id", type: "string", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        if (!this.softAuthenticate(client.sessionId, validateParams.player_id)) {
          // client.send(`EnemyGhostMovementConfirmation${validateParams.clientToChange}`, false);
          return;
        }

        const status = this.state.setSummonGhostPosition(client.sessionId, {
          id: validateParams.id,
          player_id: validateParams.player_id,
          pos: validateParams.pos.map(
            (val: { lat: number; lng: number }): { lat: number; lng: number } => {
              return {
                lat: +val.lat,
                lng: +val.lng,
              };
            },
          ),
        });
        // client.send(`EnemyGhostMovementConfirmation${validateParams.clientToChange}`, status);
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("addSummons", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "avatarUri", type: "string", PostProcess: undefined },
          { name: "name", type: "string", PostProcess: undefined },
          { name: "position", type: "object", PostProcess: undefined },
          { name: "size", type: "number", PostProcess: undefined },
          { name: "totalHealth", type: "number", PostProcess: undefined },
        ];
        // NOTE: This utilizes the player so no authentication is required.

        const validateParams: any = ValidateAllInputs(data, inputList);
        const player = this.state._getPlayerBySessionId(client.sessionId);
        if (player === undefined) return;

        // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
        ImageCatalogDB.getInstance()
          // .create(new ImageCatalogDAO(player.userId, data.avatarUri, data.imgWidth, data.imgHeight))
          .selectByImageName(validateParams.avatarUri)
          .then((imageCatalog: ImageCatalogDAO | null): void => {
            if (imageCatalog === null) return;
            SummonsDB.getInstance()
              .create(
                new SummonsDao(imageCatalog.img_catalog_id!, validateParams.name, player.userId),
              )
              .then((id: number | null): void => {
                if (id === null) return;

                this.state.addSummon(client.sessionId, {
                  id: +id,
                  player_id: player.userId,
                  avatarUri: imageCatalog.image_name,
                  name: validateParams.name,
                  position: {
                    lat: +validateParams.position.lat,
                    lng: +validateParams.position.lng,
                  },
                  size: validateParams.size,
                  health: validateParams.totalHealth,
                  totalHealth: validateParams.totalHealth,
                  deathSaves: 0,
                  lifeSaves: 0,
                });
              })
              .catch((e) => {
                console.error(e);
              });
          });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("deleteSummons", (client, data) => {
      try {
        // Player_id as this action can be called on by different people. (host vs player)
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No authentication is required as the sessionId is being used.

        this.state.removeSummon(client.sessionId, {
          id: +validateParams.id,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("updateSummons", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
          { name: "name", type: "string", PostProcess: undefined },
          { name: "avatarUri", type: "string", PostProcess: undefined },
          { name: "size", type: "number", PostProcess: undefined },
          { name: "health", type: "number", PostProcess: undefined },
          { name: "totalHealth", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No authentication is required as the sessionId is being used.

        const player = this.state._getPlayerBySessionId(client.sessionId);
        if (player === undefined) return;

        // insert enemy into the database after inserting then add the enemy to the list. If the insert faild do not add the enemy.
        ImageCatalogDB.getInstance()
          // .create(new ImageCatalogDAO(player.userId, data.avatarUri, data.imgWidth, data.imgHeight))
          .selectByImageName(validateParams.avatarUri)
          .then((imageCatalog: ImageCatalogDAO | null): void => {
            if (imageCatalog === null) return;
            SummonsDB.getInstance()
              .selectById(validateParams.id)
              .then((summon: SummonsDao | null): void => {
                if (summon === null) return;
                summon.image_id = imageCatalog.img_catalog_id!;
                summon.name = validateParams.name;

                SummonsDB.getInstance().update(summon);

                this.state.updateSummonsInformation(client.sessionId, {
                  id: +summon.getIdValue()!,
                  avatarUri: imageCatalog.image_name,
                  name: validateParams.name,
                  size: +validateParams.size,
                  health: +validateParams.health,
                  totalHealth: +validateParams.totalHealth,
                });
              })
              .catch((e) => {
                console.error(e);
              });
          });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("summonHeal", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
          { name: "heal", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.healSummons(client.sessionId, {
          id: +validateParams.id,
          heal: +validateParams.heal,
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("summonDamage", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
          { name: "damage", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.damageSummons(client.sessionId, {
          id: +validateParams.id,
          damage: +validateParams.damage,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("summonDeathAdd", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.addSummonsDeath(client.sessionId, {
          id: +validateParams.id,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("summonDeathRemove", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.removeSummonsDeath(client.sessionId, {
          id: +validateParams.id,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("summonSaveAdd", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.addSummonsSave(client.sessionId, {
          id: +validateParams.id,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("summonSaveRemove", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.removeSummonsSave(client.sessionId, {
          id: +validateParams.id,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("toggleSummonVisibility", (client, data) => {
      try {
        // Include player_id as this action can be called by multiple users (host vs player).
        const inputList: ValidationInputType[] = [
          { name: "id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.toggleSummonsVisibility(client.sessionId, {
          id: +validateParams.id,
        });
      } catch (error) {
        console.error(error);
      }
    });
    this.onMessage("setSummonsStatuses", (client, data) => {
      try {
        const inputList: ValidationInputType[] = [
          { name: "statuses", type: "array", PostProcess: undefined },
          { name: "id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);

        // NOTE: No Authentication is required as the sessionId is being used.

        this.state.setSummonsStatuses(client.sessionId, {
          id: +validateParams.id,
          statuses: validateParams.statuses,
        });
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
          .then((imageCatalog: ImageCatalogDAO | null): void => {
            if (imageCatalog === null) return;
            MapDB.getInstance()
              .create(new MapDAO(imageCatalog.img_catalog_id!, validateParams.name, player.userId))
              .then((index: number | null): void => {
                if (index === null) return;
                this.state.setMap(client.sessionId, {
                  id: +index,
                  image_name: imageCatalog.image_name,
                  width: +imageCatalog.width,
                  height: +imageCatalog.height,
                  iconHeight: +validateParams.iconHeight,
                });
                this.state.gameState = GameStateEnum.HOSTPLAY;

                // Make sure at least one save is made.
                this.saveState();
              });
          });
      } catch (error) {
        console.error(error);
      }
    });

    this.onMessage("deleteMap", (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "campaign_id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        const player = this.state._getPlayerBySessionId(client.sessionId);
        if (player === undefined) return;

        // MapDB.getInstance().delete;
        MapDB.getInstance()
          .deleteMap(validateParams.campaign_id)
          .then((value: boolean): void => {
            MapDB.getInstance()
              .selectMapByUserId(player.userId)
              .then((value: LoadCampaign[]): void => {
                client.send("CampaignResult", value);
              });
          });
      } catch (error) {
        console.error(error);
      }
    });

    // saves the map to the database
    this.onMessage("exportMap", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      this.saveState(client);
    });

    this.onMessage("clearMap", (client, _data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      this.saveState();
      this.state.RESET_GAME();
    });

    this.onMessage("SetMapMovementType", (client, data) => {
      // input validation
      try {
        if (!this.authenticateHostAction(client.sessionId)) return;
        const inputList: ValidationInputType[] = [
          {
            name: "mapMovement",
            type: "string",
            PostProcess: (val: string): MapMovementType => {
              switch (val) {
                case "free":
                  return "free";
                case "grid":
                  return "grid";
                default:
                  return "free";
              }
            },
          },
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

    /*
delete from Public."Map" where player_id = 'temp';
    */
    this.onMessage("getCampaigns", (client, _data) => {
      const player = this.state._getPlayerBySessionId(client.sessionId);
      if (!player) return client.error(666, "You are not Connected");
      MapDB.getInstance()
        .selectMapByUserId(player?.userId)
        .then((value: LoadCampaign[]): void => {
          client.send("CampaignResult", value);
        });
    });

    this.onMessage("getVersionsByCampaign", (client, data) => {
      try {
        const player = this.state._getPlayerBySessionId(client.sessionId);
        if (!player) return client.error(666, "You are not Connected");
        const inputList: ValidationInputType[] = [
          { name: "campaign_id", type: "number", PostProcess: undefined },
        ];

        const validateParams: any = ValidateAllInputs(data, inputList);
        SaveHistoryDB.getInstance()
          .selectByCampaignId(`${validateParams.campaign_id}`, player.userId)
          .then((value: SaveHistoryDAO[]): void => {
            const sendData: LoadSaveHistory[] = value.map(
              (val: SaveHistoryDAO): LoadSaveHistory => {
                return {
                  id: val.id ?? -1,
                  date: val.date,
                  map: val.map,
                  player_size: val.player_size,
                };
              },
            );

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
        .then((value: ImageCatalogDAO[]): void => {
          const sendData: LoadImage[] = value.map((val: ImageCatalogDAO): LoadImage => {
            return { image_name: val.image_name };
          });
          client.send("getImageListResult", sendData);
        });
    });

    // Function that will set all the values of a room based on the chosen save
    this.onMessage("loadMap", async (client, data) => {
      if (!this.authenticateHostAction(client.sessionId)) return;
      try {
        const inputList: ValidationInputType[] = [
          { name: "map_id", type: "number", PostProcess: undefined },
          { name: "history_id", type: "number", PostProcess: undefined },
          { name: "player_size", type: "number", PostProcess: undefined },
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
        const summonsPromise = SummonsHistoryDB.getInstance().selectByHistoryId(
          validateParams.history_id,
        );

        const savedHistoryData = await Promise.all([
          mapPromise,
          playerHistoryPromise,
          enemyHistoryPromise,
          fogHistoryPromise,
          ininitiativePromise,
          summonsPromise,
        ]);

        if (savedHistoryData[0] === undefined) return; // if the map is not present the rest of the data is useless

        const initData = savedHistoryData[4]![0] ?? { history_id: -1, initiative_index: 0 };
        this.state.loadMapData(
          savedHistoryData[0],
          +initData.initiative_index,
          +validateParams.player_size,
        );
        this.state.loadPlayerData(savedHistoryData[1] ?? []);
        this.state.loadEnemyData(savedHistoryData[2] ?? []);
        this.state.loadFogData(savedHistoryData[3] ?? []);
        this.state.loadSummonsData(savedHistoryData[5] ?? []);
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
        { name: "userId", PostProcess: undefined, type: "string" },
        { name: "name", PostProcess: undefined, type: "string" },
        { name: "avatarUri", PostProcess: undefined, type: "string" },
      ];

      const validateParams: Record<string, any> = ValidateAllInputs(options, inputList);

      // Validation Complete Lets insert into the database and create the player
      PlayerDB.getInstance().create(new PlayerDAO(validateParams.userId, validateParams.name));
      this.state.createPlayer(client.sessionId, {
        avatarUri: validateParams.avatarUri,
        name: validateParams.name,
        sessionId: client.sessionId,
        userId: validateParams.userId,
      });
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
      this.saveState();
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

  // Save the current state
  saveState(client?: Client) {
    const data: ExportDataInterface | null = this.state.exportCurrentMapData() ?? null;

    if (data === null) {
      console.log("data not saved!!");
      // client.send("exportData", new Error("Data was not saved!!"));
      return;
    }

    // const player_id = this.state._getPlayerBySessionId(client.sessionId);
    // if (player_id === undefined) return; // this data cannot be inserted into the table
    const host_id: string | undefined = this.state.currentHostUserId;
    if (host_id === undefined) {
      console.log("Host not defined");
      return;
    }

    // TODO: This should be transformed into a transaction on the database side for now this is ok for test purposes.
    SaveHistoryDB.getInstance()
      .create(new SaveHistoryDAO(new Date(), data.map.id!, host_id, data.map.iconHeight))
      .then((history_id: number | null) => {
        if (history_id === null) return;

        const savePromises: Promise<any>[] = [];
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
          const statuses: string[] = p.statuses.map((val: CharacterStatus): string => {
            return val.toString();
          });

          const playerSavePromise: Promise<any> = PlayerMovementHistoryDB.getInstance().create(
            new PlayerMovementHistoryDAO(
              history_id,
              key,
              position,
              initiative,
              health,
              totalHealth,
              deathSaves,
              lifeSaves,
              statuses,
            ),
          );
          savePromises.push(playerSavePromise);

          p.summons.forEach((curSummon: Summons): void => {
            const summons_id: number = curSummon.id;
            const size: number = curSummon.size;
            const position: mLatLng = curSummon.position;
            const health: number = curSummon.health;
            const totalHealth: number = curSummon.totalHealth;
            const deathSaves: number = curSummon.deathSaves;
            const lifeSaves: number = curSummon.lifeSaves;
            const isVisible: boolean = curSummon.isVisible;
            const statuses: string[] = curSummon.statuses.map((val: CharacterStatus): string => {
              return val.toString();
            });

            const summonSavePromise: Promise<any> = SummonsHistoryDB.getInstance().create(
              new SummonsHistoryDao(
                history_id,
                summons_id,
                p.userId,
                size,
                position,
                health,
                totalHealth,
                deathSaves,
                lifeSaves,
                isVisible,
                statuses,
              ),
            );

            savePromises.push(summonSavePromise);
          });
        });

        // Create a checkpoint for all enemies
        [...data.map.enemy.keys()].forEach((key: string): void => {
          const e: Enemy = data.map.enemy.get(key)!;

          const enemy_id: number = e.id;
          const position: mLatLng = e.position;
          const size: number = e.size;
          const initiaitive: number = e.initiative;
          const health: number = e.health;
          const totalHealth: number = e.totalHealth;
          const deathSaves: number = e.deathSaves;
          const lifeSaves: number = e.lifeSaves;
          const isVisible: boolean = e.isVisible;
          const statuses: string[] = e.statuses.map((val: CharacterStatus): string => {
            return val.toString();
          });

          const enemySavePromise: Promise<any> = EnemyMovementHistoryDB.getInstance().create(
            new EnemyMovementHistoryDAO(
              history_id,
              enemy_id,
              size,
              position,
              initiaitive,
              health,
              totalHealth,
              deathSaves,
              lifeSaves,
              isVisible,
              statuses,
            ),
          );

          savePromises.push(enemySavePromise);
        });

        // Time for fogs
        [...data.map.fogs.keys()].forEach((key) => {
          const visible = data.map.fogs.get(key)!.isVisible;
          const fogSavePromise: Promise<any> = FogStateHistoryDB.getInstance().create(
            new FogStateHistoryDAO(history_id, +key, visible),
          );
          savePromises.push(fogSavePromise);
        });

        const initiativeSavePromise: Promise<any> = InitiativeHistoryDB.getInstance().create(
          new InitiativeHistoryDAO(history_id, data.map.initiativeIndex),
        );
        savePromises.push(initiativeSavePromise);

        if (client !== undefined) {
          Promise.allSettled(savePromises)
            .then((value: PromiseSettledResult<any>[]): void => {
              let errorAmount: number = 0;
              value.forEach((promiseReturn: PromiseSettledResult<any>): void => {
                if (promiseReturn.status === "rejected") {
                  errorAmount++;
                }
              });
              /**
              0 = SUCCESS
              1 = WARNING - Partial Save
              2 = ERROR - NO SAVE
              */
              const sendRes: { level: number } = { level: 0 };
              if (errorAmount === 0) {
                sendRes.level = 0;
              } else if (errorAmount < value.length) {
                sendRes.level = 1;
              } else {
                sendRes.level = 2;
              }

              client.send("SaveStatus", sendRes);
            })
            .catch((_e: any): void => {
              // This should never happen.
              console.error("Error in promise.settled of save function");
            });
        }
      })
      .catch((_e: any): void => {
        if (client !== undefined) {
          // Send back a compelte failure
          client.send("SaveStatus", { level: 2 });
        }
      });
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

    return this.authenticateHostAction(issuer_session_id) || issuer.userId === reciever.userId;
  }

  authenticateHostAction(session_id: string) {
    // console.log("start authentication")
    const user = this.state._getPlayerBySessionId(session_id);
    if (user === undefined) return false;

    return (
      this.state.currentHostUserId !== undefined &&
      user.isHost &&
      this.state.currentHostUserId === user.userId
    );
  }

  //#endregion
}
