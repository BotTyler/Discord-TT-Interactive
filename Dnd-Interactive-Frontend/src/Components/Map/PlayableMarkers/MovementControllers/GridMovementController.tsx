import { LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane, useMap, useMapEvents } from "react-leaflet";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { Enemy } from "../../../../shared/Enemy";
import { MapData } from "../../../../shared/Map";
import { Player } from "../../../../shared/Player";
import { DistanceLineGrid } from "../DistanceLine";
import MarkerDisplay from "../MarkerDisplay";
import { Summons } from "../../../../shared/Summons";
import { CharacterStatus } from "../../../../shared/StatusTypes";

export default function GridMovementController({ controllableUser, userType, onPositionChange, onGhostPositionChange }:
  {
    controllableUser: Player | Enemy | Summons;
    userType: "player" | "enemy" | "summon";
    onPositionChange: (position: LatLng) => void;
    onGhostPositionChange: (position: LatLng[]) => void
  }) {

  const [markerUser, setMarkerUser] = useState<Player | Enemy | Summons>(controllableUser);

  const leafletMap = useMap();
  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();
  const toolContext = useGameToolContext();

  const [id, setId] = useState<string>((markerUser as Player).userId ?? (markerUser as Enemy | Summons).id);
  const [name, setName] = useState<string>(markerUser.name);
  const [avatarUri, setAvatarUri] = useState<string>(markerUser.avatarUri);
  const [markerSize, setMarkerSize] = useState<number>((markerUser as Enemy | Summons).size ?? mapContext.getIconHeight());
  const [iconSize, setIconSize] = useState<number>(mapContext.getIconHeight());
  const [position, setPosition] = useState<LatLng>(new LatLng(markerUser.position.lat, markerUser.position.lng));
  const [toPosition, setToPosition] = useState<LatLng[]>([position]);
  const [isConnected, setConnected] = useState<boolean>((markerUser as Player).isConnected ?? true);
  const [color, setColor] = useState<string>((markerUser as Player).color ?? "#f00");
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>((markerUser as Enemy | Summons).isVisible ?? true);
  const [health, setHealth] = useState<number>(markerUser.health);
  const [totalHealth, setTotalHealth] = useState<number>(markerUser.totalHealth);
  const [statuses, setStatuses] = useState<CharacterStatus[]>(markerUser.statuses);

  // handles hovering for the status effect overflow.
  // Required in this component due to how react leaflet is rendered.
  // Once the component is created, there is no way to modify the component without updating a parameter.
  const [isHovering, setHovering] = useState<boolean>(false);

  // use the map like this may be dangerous, but this component does not load until the map is set.
  const [mapWidth, setMapWidth] = useState<number>(mapContext.getMap()!.width);
  const [mapHeight, setMapHeight] = useState<number>(mapContext.getMap()!.height);

  const isMovingRef = useRef(isMoving);
  useEffect(() => {
    isMovingRef.current = isMoving;
  }, [isMoving])

  const calculateNearestcenter = useCallback((position: LatLng): LatLng => {
    const halfIcon = iconSize / 2;
    const centerLng: number = Math.floor(position.lng / iconSize) * iconSize + halfIcon;
    const centerLat: number = Math.floor(position.lat / iconSize) * iconSize + halfIcon;

    const xDiff: number = position.lng - centerLng;
    const yDiff: number = position.lat - centerLat;

    // Calculate the quadrant the mouse is in compared to the estimated center.
    // This will be used to assist in estimating the direction the user is heading in.
    const offsetXMult: 1 | -1 = xDiff >= 0 ? 1 : -1;
    const offsetYMult: 1 | -1 = yDiff >= 0 ? 1 : -1;

    const offset = Math.floor(markerSize / iconSize) % 2 == 0 ? halfIcon : 0;
    const xval: number = centerLng + (offset * offsetXMult);
    const yval: number = centerLat + (offset * offsetYMult);
    return new LatLng(yval, xval);

  }, [mapWidth, mapHeight, iconSize, markerSize]);

  useEffect(() => {
    setMarkerUser(controllableUser);
  }, [controllableUser]);


  useEffect(() => {
    // setup listeners for the player.
    if (userType !== "player") return;

    const tempUser: Player = markerUser as Player;

    const setNewPosition = (value: any) => {
      setPosition(value.detail.val);
    };
    const handleAvatarUriChange = (value: any) => {
      setAvatarUri(value.detail.val);
    };
    const handleNameChange = (value: any) => {
      setName(value.detail.val);
    };
    const handleIconHeightChange = (value: any) => {
      setIconSize(value.detail.val);
      setMarkerSize(value.detail.val);
    };
    const handleConnectionChange = (value: any) => {
      setConnected(value.detail.val);
    };
    const handleColorChange = (value: any) => {
      setColor(value.detail.val);
    };
    const handleMapUpdate = (value: any) => {
      const mapData: MapData | undefined = value.detail.val as MapData;
      if (mapData == null) return;
      setMapWidth(mapData.width);
      setMapHeight(mapData.height);
    };
    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMovingRef.current)
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
    };
    const handleHealthChange = (value: any) => {
      setHealth(value.detail.val);
    }
    const handleTotalHealthChange = (value: any) => {
      setTotalHealth(value.detail.val);
    }
    const handleStatusChange = (value: any) => {
      setStatuses(value.detail.val);
    };

    window.addEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
    window.addEventListener(`update-${tempUser.userId}-name`, handleNameChange);
    window.addEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
    window.addEventListener(`update-${tempUser.userId}-position`, setNewPosition);
    window.addEventListener(`update-${tempUser.userId}-color`, handleColorChange);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`MapUpdate`, handleMapUpdate);
    window.addEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
    window.addEventListener(`update-${tempUser.userId}-health`, handleHealthChange);
    window.addEventListener(`update-${tempUser.userId}-totalHealth`, handleTotalHealthChange);
    window.addEventListener(`update-${tempUser.userId}-statuses`, handleStatusChange);
    return () => {
      window.removeEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
      window.removeEventListener(`update-${tempUser.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
      window.removeEventListener(`update-${tempUser.userId}-position`, setNewPosition);
      window.removeEventListener(`update-${tempUser.userId}-color`, handleColorChange);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`MapUpdate`, handleMapUpdate);
      window.removeEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
      window.removeEventListener(`update-${tempUser.userId}-health`, handleHealthChange);
      window.removeEventListener(`update-${tempUser.userId}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`update-${tempUser.userId}-statuses`, handleStatusChange);
    }

  }, [markerUser]);

  useEffect(() => {
    setPosition((prev) => {
      // ensure position is set to the nearest
      const centeredPos: LatLng = calculateNearestcenter(prev);
      onPositionChange(centeredPos);
      return centeredPos;
    })
  }, [iconSize, markerSize]);


  useEffect(() => {
    // setup listeners for the enemy.
    if (userType !== "enemy") return;

    const tempEnemy: Enemy = markerUser as Enemy;

    const updateName = (value: any) => {
      setName(value.detail.val);
    }
    const updatePosition = (value: any) => {
      setPosition(value.detail.val);
    };
    const updateSize = (value: any) => {
      setMarkerSize(value.detail.val);
    };
    const handleIconHeightChange = (value: any) => {
      setIconSize(value.detail.val);
    };
    const updateAvatar = (value: any) => {
      setAvatarUri(value.detail.val);
    };
    const handleVisibilityChange = (value: any) => {
      setIsVisible(value.detail.val);
    }
    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMovingRef.current)
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
    };
    const handleHealthChange = (value: any) => {
      setHealth(value.detail.val);
    }
    const handleTotalHealthChange = (value: any) => {
      setTotalHealth(value.detail.val);
    }
    const handleStatusChange = (value: any) => {
      setStatuses(value.detail.val);
    };

    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-isVisible`, handleVisibilityChange);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-health`, handleHealthChange);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-totalHealth`, handleTotalHealthChange);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-statuses`, handleStatusChange);
    return () => {
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-isVisible`, handleVisibilityChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-health`, handleHealthChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-statuses`, handleStatusChange);
    }

  }, [markerUser]);

  useEffect(() => {
    // setup listeners for the enemy.
    if (userType !== "summon") return;

    const tempSummon: Summons = markerUser as Summons;

    const updateName = (value: any) => {
      setName(value.detail.val);
    }
    const updatePosition = (value: any) => {
      setPosition(value.detail.val);
    };
    const updateSize = (value: any) => {
      setMarkerSize(value.detail.val);
    };
    const updateColor = (value: any) => {
      setColor(value.detail.val);
    };
    const handleIconHeightChange = (value: any) => {
      setIconSize(value.detail.val);
    };
    const updateAvatar = (value: any) => {
      setAvatarUri(value.detail.val);
    };
    const handleVisibilityChange = (value: any) => {
      setIsVisible(value.detail.val);
    }
    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMovingRef.current)
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
    };
    const handleHealthChange = (value: any) => {
      setHealth(value.detail.val);
    }
    const handleTotalHealthChange = (value: any) => {
      setTotalHealth(value.detail.val);
    }
    const handleStatusChange = (value: any) => {
      setStatuses(value.detail.val);
    };

    window.addEventListener(`SummonUpdate-${tempSummon.id}-name`, updateName);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-position`, updatePosition);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-size`, updateSize);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-color`, updateColor);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-avatarUri`, updateAvatar);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-toPosition`, setNewToPosition);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-isVisible`, handleVisibilityChange);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-health`, handleHealthChange);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-totalHealth`, handleTotalHealthChange);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-statuses`, handleStatusChange);
    return () => {
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-name`, updateName);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-position`, updatePosition);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-size`, updateSize);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-color`, updateColor);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-avatarUri`, updateAvatar);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-toPosition`, setNewToPosition);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-isVisible`, handleVisibilityChange);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-health`, handleHealthChange);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-statuses`, handleStatusChange);
    }

  }, [markerUser]);


  useMapEvents({
    mousemove: (event: LeafletMouseEvent) => {
      if (!isMoving) return;
      setToPosition((prev) => {
        const mousePos: LatLng = event.latlng;
        const calcCenter: LatLng = calculateNearestcenter(mousePos);

        const distance: number = leafletMap.distance(mousePos, calcCenter);
        const confidence: number = distance * 2 / iconSize;
        if (confidence > 1) return [...prev];

        if (prev.length > 0) {
          const last: LatLng = prev[prev.length - 1];
          if (last.equals(calcCenter)) {
            return [...prev];
          }
        }
        const result = [...prev, calcCenter];
        onGhostPositionChange(result);
        return result;
      })
    }
  })

  const determineVisibility = (): boolean => {
    if (isVisible) return true;

    const authPlayer: Player | undefined = playerContext.getPlayer(authContext.user.id);
    if (authPlayer != null && authPlayer.isHost) {
      return true;
    }
    return false;
  }

  const handleToolEvent = (): void => {
    const handleVisibibilityTool = (): void => {
      switch (userType) {
        case "player":
          break;
        case "enemy":
          authContext.room.send("toggleEnemyVisibility", { clientToChange: `${id}` });
          break;
        case "summon":
          authContext.room.send("toggleSummonVisibility", { id: +id, player_id: (markerUser as Summons).player_id });
          break;
      }
    }

    const handleDeleteTool = (): void => {
      switch (userType) {
        case "player":
          break;
        case "enemy":
          authContext.room.send("deleteEnemy", { id: `${id}` });
          break;
        case "summon":
          authContext.room.send("deleteSummons", { id: +id, player_id: (markerUser as Summons).player_id });
          break;
      }
    }
    switch (toolContext.curTool) {
      case Tools.VISIBILITY:
        handleVisibibilityTool();
        break;
      case Tools.DELETE:
        handleDeleteTool();
        break
    }
  }

  return determineVisibility() ? (
    <>
      <Pane name={`Grid-${userType}-Marker-${id}`} style={{ zIndex: 500 }}>
        <MarkerDisplay
          name={name}
          avatarURI={userType === "player" ? avatarUri : `/colyseus/getImage/${avatarUri}`}
          color={color}
          position={position}
          size={markerSize}
          health={health}
          totalHealth={totalHealth}
          className={isVisible ? "opacity-100" : "opacity-50"}
          statuses={statuses}
          isHovering={isHovering && !isMoving}
        />
      </Pane>
      <DistanceLineGrid positions={toPosition} color={color} playerSize={markerSize} />
      <Pane name={`Grid-${userType}-Ghost-Marker-${id}`} style={{ zIndex: 501 }}>
        {/* size needs to be at least the iconSize due to issues with mouse up event */}
        <MarkerDisplay
          name={name}
          avatarURI={userType === "player" ? avatarUri : `/colyseus/getImage/${avatarUri}`}
          color={color}
          position={toPosition[toPosition.length - 1] ?? position}
          size={isMoving ? Math.max(markerSize, iconSize) : markerSize}
          isDraggable={true}
          className={`opacity-50`}
          displayName={false}
          health={health}
          totalHealth={totalHealth}
          eventFunctions={{
            dragstart: (event: LeafletEvent) => {
              setIsMoving(true);
            },
            mouseup: (event: LeafletMouseEvent) => {
              if (event.originalEvent.button === 0) { // LMB press
                if (isMoving) {
                  setIsMoving(false);
                  onPositionChange(event.latlng);
                  setToPosition([new LatLng(position.lat, position.lng)]);
                } else {
                  handleToolEvent();
                }
              } else {
                // Cancel request
                setIsMoving(false);
                onPositionChange(position);
                setToPosition([new LatLng(position.lat, position.lng)]);
              }
            },
            mouseover: () => setHovering(true),
            mouseout: () => setHovering(false)
          }} />
      </Pane>
    </>
  ) : <></>
}
