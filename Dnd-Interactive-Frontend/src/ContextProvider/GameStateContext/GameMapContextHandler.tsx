import { Enemy } from "../../../src/shared/Enemy";
import { GameStateEnum, MapMovementType } from "../../../src/shared/State";
import { MapData, MapFogPolygon } from "../../../src/shared/Map";
import React, { useImperativeHandle } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import EnemyContextElement from "./EnemyContextElement";
import FogContextElement from "./FogContextElement";

export const GameMapContextHandler = React.forwardRef(function GameMapContextHandler({ }: {}, ref: any) {
  const authenticatedContext = useAuthenticatedContext();
  const [currentGameState, setGameState] = React.useState<GameStateEnum>(GameStateEnum.MAINMENU);
  const [map, setMap] = React.useState<MapData | undefined>(getBaseMapFromAuthContext());
  const [mapMovement, setMapMovement] = React.useState<MapMovementType>("free");
  const [curHostId, setCurHostId] = React.useState<string | undefined>(authenticatedContext.room.state.currentHostUserId);

  // Following variables are held within the map class. These variables are the only ones that have the possibility of changing within the data.
  // They are separated from the object for ease of use.
  //Enemy list
  const [enemies, setEnemies] = React.useState<{ [key: string]: Enemy }>({});
  const [connectedEnemies, setConnectedEnemies] = React.useState<{ [key: string]: string }>({});
  // Fog List
  const [fogs, setFogs] = React.useState<{ [key: string]: MapFogPolygon }>({});
  const [connectedFogs, setConnectedFogs] = React.useState<{ [key: string]: string }>({});
  // icon height
  const [iconHeight, setIconHeight] = React.useState<number>(0);
  // Init index
  const [initiativeIndex, setInitiative] = React.useState<number>(0);

  function getBaseMapFromAuthContext(): MapData | undefined {
    const mMap = authenticatedContext.room.state.map;

    return mMap == null || mMap.mapBase64 == null ? undefined : mMap;
  }

  useImperativeHandle(
    ref,
    () => ({
      getMap(): MapData | undefined {
        return map;
      },
      getMapMovement(): MapMovementType {
        return mapMovement;
      },
      getCurrentHostId(): string | undefined {
        return curHostId;
      },
      getCurrentGameState(): GameStateEnum {
        return currentGameState;
      },
      getEnemies(): { [key: string]: Enemy } {
        return enemies;
      },
      getEnemy(id: string): Enemy | undefined {
        return enemies[id];
      },
      getFogs(): { [key: string]: MapFogPolygon } {
        return fogs;
      },
      getFog(id: string): MapFogPolygon | undefined {
        return fogs[id];
      },
      getIconHeight(): number {
        return iconHeight;
      },
      getInitiativeIndex(): number {
        return initiativeIndex;
      },
    }),
    [map, mapMovement, curHostId, currentGameState, enemies, fogs, iconHeight, initiativeIndex]
  );

  const emitFieldChangeEvent = (field: string, value: any) => {
    const event = new CustomEvent(`${field}`, {
      detail: { val: value },
    });
    window.dispatchEvent(event);
  };
  // below are listeners for the gamestate map and currenthostid
  React.useEffect(() => {
    emitFieldChangeEvent(`ChangeGameState`, currentGameState);
  }, [currentGameState]);
  React.useEffect(() => {
    emitFieldChangeEvent(`HostIdChange`, curHostId);
  }, [curHostId]);
  React.useEffect(() => {
    emitFieldChangeEvent(`MapUpdate`, map);
  }, [map]);
  React.useEffect(() => {
    emitFieldChangeEvent(`EnemiesChanged`, enemies);
  }, [connectedEnemies]);
  React.useEffect(() => {
    emitFieldChangeEvent(`FogsChanged`, fogs);
  }, [connectedFogs]);
  React.useEffect(() => {
    emitFieldChangeEvent(`IconHeightChanged`, iconHeight);
  }, [iconHeight]);
  React.useEffect(() => {
    emitFieldChangeEvent(`InitiativeIndexChanged`, initiativeIndex);
    const event = new CustomEvent(`InitiativeIndexChanged`, {
      detail: { val: initiativeIndex },
    });
    window.dispatchEvent(event);
  }, [initiativeIndex]);
  React.useEffect(()=>{
    emitFieldChangeEvent("MapMovementChanged", mapMovement);
  }, [mapMovement]);

  React.useEffect(() => {
    const GameStateCallback = authenticatedContext.room.state.listen("gameState", (value: any) => {
      setGameState(value);
    });

    const mapCallback = authenticatedContext.room.state.listen("map", (value: any) => {
      if (value == undefined || value.mapBase64 === undefined) {
        setMap(undefined);
        return;
      }
      setMap(value);
    });

    const hostIdListener = authenticatedContext.room.state.listen("currentHostUserId", (value: any) => {
      if (value == undefined) {
        setCurHostId(undefined);
        return;
      }
      setCurHostId(value);
    });

    const mapMovementListener = authenticatedContext.room.state.listen("mapMovement", (value: MapMovementType) => {
      setMapMovement(value);
    })

    return () => {
      GameStateCallback();
      mapCallback();
      hostIdListener();
      mapMovementListener();
    };
  }, [authenticatedContext.room]);

  // all listeners for the enemies list only (No Enemy Properties)
  React.useEffect(() => {
    if (map == null) return;

    // set the listeners for enemy
    const enemyAdd = map.enemy.onAdd((item: Enemy, key: string) => {
      setEnemies((prev) => {
        return { ...prev, [key]: item };
      });
      setConnectedEnemies((prev) => {
        return { ...prev, [key]: key };
      });
    });
    // delete enemies

    const enemyRemove = map.enemy.onRemove((item: Enemy, key: string) => {
      setEnemies((prev) => {
        const { [key]: _, ...temp } = prev;
        return temp;
      });
      setConnectedEnemies((prev) => {
        const { [key]: _, ...temp } = prev;
        return temp;
      });
    });

    // full change
    const handleEnemyChange = (i: any) => {
      const itemList = [...i.$items]; // should be a list where an element 0 - key and 1 - enemy value
      const enemyObject: { [key: string]: Enemy } = {};
      const connectedEnemyObject: { [key: string]: string } = {};
      itemList.forEach((value) => {
        enemyObject[value[0]] = value[1];
        connectedEnemyObject[value[0]] = value[0];
      });

      setEnemies((prev) => {
        return enemyObject;
      });
      setConnectedEnemies((prev) => {
        return connectedEnemyObject;
      });
    };
    const enemyListen = map.listen("enemy", (val) => handleEnemyChange(val));

    return () => {
      enemyListen();
      enemyAdd();
      enemyRemove();
    };
  }, [authenticatedContext.room, map]);

  // all listeners for the Fogs list only (No Fogg Properties)
  React.useEffect(() => {
    if (map == undefined) return;

    // set the listeners for enemy
    const fogAdd = map.fogs.onAdd((item: MapFogPolygon, key: string) => {
      setFogs((prev) => {
        return { ...prev, [key]: item };
      });
      setConnectedFogs((prev) => {
        return { ...prev, [key]: key };
      });
    });
    // delete enemies

    const fogRemove = map.fogs.onRemove((item: MapFogPolygon, key: string) => {
      setFogs((prev) => {
        const { [key]: _, ...temp } = prev;
        return temp;
      });
      setConnectedFogs((prev) => {
        const { [key]: _, ...temp } = prev;
        return temp;
      });
    });

    // full change
    const handleFogChange = (i: any) => {
      const itemList = [...i.$items]; // should be a list where an element 0 - key and 1 - enemy value
      const fogObject: { [key: string]: MapFogPolygon } = {};
      const connectedFogObject: { [key: string]: string } = {};
      itemList.forEach((value) => {
        fogObject[value[0]] = value[1];
        connectedFogObject[value[0]] = value[0];
      });

      setFogs((prev) => {
        return fogObject;
      });
      setConnectedFogs((prev) => {
        return connectedFogObject;
      });
    };
    const fogListen = map.listen("fogs", (val) => handleFogChange(val));

    return () => {
      fogListen();
      fogAdd();
      fogRemove();
    };
  }, [authenticatedContext.room, map]);

  React.useEffect(() => {
    if (map == undefined) return;
    const iconHeightListener = map.listen("iconHeight", (val) => {
      setIconHeight(val);
    });

    const initiativeIndexListener = map.listen("initiativeIndex", (val) => {
      setInitiative(val);
    });

    return () => {
      iconHeightListener();
      initiativeIndexListener();
    };
  }, [authenticatedContext.room, map]);

  return (
    <>
      {Object.keys(connectedEnemies).map((key) => {
        return (
          <EnemyContextElement
            key={`EnemyContextElement-${key}`}
            enemy={enemies[key]}
            onValueChanged={(field: string, value: unknown) => {
              setEnemies((prev) => {
                const newEnemies = { ...prev };
                if (newEnemies[key]) {
                  // @ts-expect-error
                  newEnemies[key][field] = value;
                }

                return newEnemies;
              });
            }}
          />
        );
      })}
      {Object.keys(connectedFogs).map((key) => {
        return (
          <FogContextElement
            key={`FogContextElement-${key}`}
            fog={fogs[key]}
            onValueChanged={(field: string, value: unknown) => {
              setFogs((prev) => {
                const newFogs = { ...prev };
                if (newFogs[key]) {
                  // @ts-expect-error
                  newFogs[key][field] = value;
                }

                return newFogs;
              });
            }}
          />
        );
      })}
    </>
  );
});
