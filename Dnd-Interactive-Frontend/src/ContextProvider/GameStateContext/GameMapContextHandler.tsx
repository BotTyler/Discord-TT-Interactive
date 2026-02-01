import { Enemy } from "../../../src/shared/Enemy";
import { GameStateEnum, MapMovementType } from "../../../src/shared/State";
import React, { useImperativeHandle } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import EnemyContextElement from "./EnemyContextElement";
import { MapData } from "../../shared/Map";

export const GameMapContextHandler = React.forwardRef(function GameMapContextHandler({ }: {}, ref: any) {
  const authenticatedContext = useAuthenticatedContext();
  const [currentGameState, setGameState] = React.useState<GameStateEnum>(GameStateEnum.MAINMENU);

  // Even if the state is null the below map might return undefined for some unknown reason.
  const [map, setMap] = React.useState<MapData | null>(
    ((authenticatedContext.room.state.map ?? null) === null || (authenticatedContext.room.state.map?.mapBase64 == null))
      ? null
      : authenticatedContext.room.state.map

  );
  const [mapMovement, setMapMovement] = React.useState<MapMovementType>("free");
  const [curHostId, setCurHostId] = React.useState<string | undefined>(authenticatedContext.room.state.currentHostUserId);

  // Following variables are held within the map class. These variables are the only ones that have the possibility of changing within the data.
  // They are separated from the object for ease of use.
  //Enemy list
  const [enemies, setEnemies] = React.useState<{ [key: string]: Enemy }>({});
  const [connectedEnemies, setConnectedEnemies] = React.useState<{ [key: string]: string }>({});
  // icon height
  const [iconHeight, setIconHeight] = React.useState<number>(0);
  // Init index
  const [initiativeIndex, setInitiative] = React.useState<number>(0);

  // Grid values
  const [gridColor, setGridColor] = React.useState<string>("");
  const [gridShowing, setGridShowing] = React.useState<boolean>(true);

  useImperativeHandle(
    ref,
    () => ({
      getMap(): MapData | null {
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
      getIconHeight(): number {
        return iconHeight;
      },
      getInitiativeIndex(): number {
        return initiativeIndex;
      },
      getGridColor(): string {
        return gridColor;
      },
      getGridShowing(): boolean {
        return gridShowing;
      }
    }),
    [map, mapMovement, curHostId, currentGameState, enemies, iconHeight, initiativeIndex, gridColor, gridShowing]
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
  }, [enemies]);
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
  React.useEffect(() => {
    emitFieldChangeEvent("MapMovementChanged", mapMovement);
  }, [mapMovement]);
  React.useEffect(() => {
    emitFieldChangeEvent("GridDisplayChange", gridShowing);
  }, [gridShowing]);
  React.useEffect(() => {
    emitFieldChangeEvent("GridColorChange", gridColor);
  }, [gridColor]);

  React.useEffect(() => {
    const GameStateCallback = authenticatedContext.room.state.listen("gameState", (value: any) => {
      setGameState(value);
    });

    const mapCallback = authenticatedContext.room.state.listen("map", (value: any) => {
      if (value === null || value.mapBase64 == null) {
        setMap(null);
      } else {
        setMap(value);
      }
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
    const gridColorListener = authenticatedContext.room.state.listen("gridColor", (value: string) => {
      setGridColor(value);
    })
    const gridShowingListener = authenticatedContext.room.state.listen("gridShowing", (value: boolean) => {
      setGridShowing(value);
    })

    return () => {
      GameStateCallback();
      mapCallback();
      hostIdListener();
      mapMovementListener();
      gridColorListener();
      gridShowingListener();
    };
  }, [authenticatedContext.room]);

  // all listeners for the enemies list only (No Enemy Properties)
  React.useEffect(() => {
    if (map === null) return;

    // set the listeners for enemy
    const enemyAdd = authenticatedContext.room.state.enemies.onAdd((item: Enemy, key: string) => {
      setEnemies((prev) => {
        return { ...prev, [key]: item };
      });
      setConnectedEnemies((prev) => {
        return { ...prev, [key]: key };
      });
    });
    // delete enemies

    const enemyRemove = authenticatedContext.room.state.enemies.onRemove((item: Enemy, key: string) => {
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
    const enemyListen = authenticatedContext.room.state.listen("enemies", (val) => handleEnemyChange(val));

    return () => {
      enemyListen();
      enemyAdd();
      enemyRemove();
    };
  }, [authenticatedContext.room, map]);

  React.useEffect(() => {
    if (map === null) return;
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
    </>
  );
});
