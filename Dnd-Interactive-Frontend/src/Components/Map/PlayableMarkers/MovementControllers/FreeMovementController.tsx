import { LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane, useMapEvents } from "react-leaflet";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { Enemy } from "../../../../shared/Enemy";
import { Player } from "../../../../shared/Player";
import DistanceLine from "../DistanceLine";
import MarkerDisplay from "../MarkerDisplay";
import { Summons } from "../../../../shared/Summons";
import { CharacterStatus } from "../../../../shared/StatusTypes";
import { MARKER_SIZE_CATEGORIES } from "../../../../shared/MarkerOptions";

export default function FreeMovementController({ controllableUser, userType, onPositionChange, onGhostPositionChange }:
  {
    controllableUser: Player | Enemy | Summons;
    userType: "player" | "enemy" | "summon";
    onPositionChange: (position: LatLng) => void;
    onGhostPositionChange: (position: LatLng[]) => void
  }) {
  const [markerUser, setMarkerUser] = useState<any>(controllableUser);

  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();
  const toolContext = useGameToolContext();

  const [id, setId] = useState<string>(markerUser.userId ?? markerUser.id);
  const [name, setName] = useState<string>(markerUser.name);
  const [avatarUri, setAvatarUri] = useState<string>(markerUser.avatarUri);
  // const [markerSize, setMarkerSize] = useState<number>(mapContext.getIconHeight());
  const [sizeCategory, setSizeCategory] = useState<MARKER_SIZE_CATEGORIES>((markerUser as Enemy | Summons).size_category ?? "MEDIUM");
  const [iconSize, setIconSize] = useState<number>(mapContext.getIconHeight());
  const [position, setPosition] = useState<LatLng>(new LatLng(markerUser.position.lat, markerUser.position.lng));
  const [toPosition, setToPosition] = useState<LatLng[]>([position]);
  const [isConnected, setConnected] = useState<boolean>((markerUser as Player).isConnected ?? true);
  const [color, setColor] = useState<string>((markerUser as Player | Summons).color ?? "#f00");
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isVisible, setVisibility] = useState<boolean>((markerUser as Enemy).isVisible ?? true); // Only enemy visibility can change
  const [health, setHealth] = useState<number>(markerUser.health);
  const [totalHealth, setTotalHealth] = useState<number>(markerUser.totalHealth);
  const [statuses, setStatuses] = useState<CharacterStatus[]>(markerUser.statuses);

  // handles hovering for the status effect overflow.
  // Required in this component due to how react leaflet is rendered.
  // Once the component is created, there is no way to modify the component without updating a parameter.
  const [isHovering, setHovering] = useState<boolean>(false);

  useEffect(() => {
    setMarkerUser(controllableUser);
  }, [controllableUser]);

  const isMovingRef = useRef(isMoving);
  useEffect(() => {
    isMovingRef.current = isMoving;
  }, [isMoving])

  const calcSizeCategoryMultiplier = useCallback((): number => {
    switch (sizeCategory) {
      case "TINY":
        return iconSize * 0.5;
      case "SMALL":
        return iconSize * 0.85;
      case "MEDIUM":
        return iconSize * 1;
      case "LARGE":
        return iconSize * 2;
      case "HUGE":
        return iconSize * 3;
      case "GARGANTUAN":
        return iconSize * 4;
    }
  }, [sizeCategory, iconSize]);

  useEffect(() => {
    // setup listeners for the player.
    if (userType !== "player") return;

    const tempUser: Player = markerUser as Player;

    const setNewPosition = (value: any) => {
      setPosition(value.detail.val);
    };
    const handleAvatarUriChange = (value: any) => {
      setAvatarUri(value.detail.val);
    }
    const handleNameChange = (value: any) => {
      setName(value.detail.val);
    }
    const handleIconHeightChange = (value: any) => {
      setIconSize(value.detail.val);
    };
    const handleConnectionChange = (value: any) => {
      setConnected(value.detail.val);
    };
    const handleColorChange = (value: any) => {
      setColor(value.detail.val);
    };
    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMovingRef.current) {
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
      }
    };
    const handleHealthChange = (value: any) => {
      setHealth(value.detail.val);
    }
    const handleTotalHealthChange = (value: any) => {
      setTotalHealth(value.detail.val);
    }
    const handleStatusChange = (value: any) => {
      setStatuses(value.detail.val);
    }

    window.addEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
    window.addEventListener(`update-${tempUser.userId}-name`, handleNameChange);
    window.addEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
    window.addEventListener(`update-${tempUser.userId}-position`, setNewPosition);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`update-${tempUser.userId}-color`, handleColorChange);
    window.addEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
    window.addEventListener(`update-${tempUser.userId}-health`, handleHealthChange);
    window.addEventListener(`update-${tempUser.userId}-totalHealth`, handleTotalHealthChange);
    window.addEventListener(`update-${tempUser.userId}-statuses`, handleStatusChange);
    return () => {
      window.removeEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
      window.removeEventListener(`update-${tempUser.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
      window.removeEventListener(`update-${tempUser.userId}-position`, setNewPosition);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`update-${tempUser.userId}-color`, handleColorChange);
      window.removeEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
      window.removeEventListener(`update-${tempUser.userId}-health`, handleHealthChange);
      window.removeEventListener(`update-${tempUser.userId}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`update-${tempUser.userId}-statuses`, handleStatusChange);
    }

  }, [markerUser]);


  useEffect(() => {
    // setup listeners for the Enemy.
    if (userType !== "enemy") return;

    const tempEnemy: Enemy = markerUser as Enemy;

    const updateName = (value: any) => {
      setName(value.detail.val);
    }
    const updatePosition = (value: any) => {
      setPosition(value.detail.val);
    };
    const updateSize = (value: any) => {
      setSizeCategory(value.detail.val);
    };
    const updateAvatar = (value: any) => {
      setAvatarUri(value.detail.val);
    };
    const handleIconHeightChange = (value: any) => {
      setIconSize(value.detail.val);
    };
    const handleVisibilityChange = (value: any) => {
      setVisibility(value.detail.val)
    }
    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMovingRef.current) {
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
      }
    };
    const handleHealthChange = (value: any) => {
      setHealth(value.detail.val);
    }
    const handleTotalHealthChange = (value: any) => {
      setTotalHealth(value.detail.val);
    }
    const handleStatusChange = (value: any) => {
      setStatuses(value.detail.val);
    }

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
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-isVisible`, handleVisibilityChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-health`, handleHealthChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-statuses`, handleStatusChange);
    }

  }, [markerUser]);

  useEffect(() => {
    // setup listeners for the Enemy.
    if (userType !== "summon") return;

    const tempSummon: Summons = markerUser as Summons;

    const updateName = (value: any) => {
      setName(value.detail.val);
    }
    const updatePosition = (value: any) => {
      setPosition(value.detail.val);
    };
    const updateSize = (value: any) => {
      setSizeCategory(value.detail.val);
    };
    const updateColor = (value: any) => {
      setColor(value.detail.val);
    };
    const updateAvatar = (value: any) => {
      setAvatarUri(value.detail.val);
    };
    const handleIconHeightChange = (value: any) => {
      setIconSize(value.detail.val);
    };
    const handleVisibilityChange = (value: any) => {
      setVisibility(value.detail.val)
    }
    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMovingRef.current) {
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
      }
    };
    const handleHealthChange = (value: any) => {
      setHealth(value.detail.val);
    }
    const handleTotalHealthChange = (value: any) => {
      setTotalHealth(value.detail.val);
    }
    const handleStatusChange = (value: any) => {
      setStatuses(value.detail.val);
    }

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
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-avatarUri`, updateAvatar);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
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
        onGhostPositionChange([event.latlng]);
        return [event.latlng];
      });
    }
  })

  // NOTE: This function determines if the  component will be rendered. This does not describe how to display the element.
  const determineVisibility = (): boolean => {
    if (isVisible) return true;

    if (userType === "summon") return true;

    const authPlayer: Player | undefined = playerContext.getPlayer(authContext.user.id);
    if (authPlayer != null && authPlayer.isHost) {
      return true;
    }
    return false;
  }

  const handleToolEvent = (): void => {
    const handleVisibilityRequest = () => {
      switch (userType) {
        case "player":
          break;
        case "enemy":
          authContext.room.send("toggleEnemyVisibility", { clientToChange: `${id}` });
          break;
        case "summon":
          authContext.room.send("toggleSummonVisibility", { id: +id, player_id: markerUser.player_id });
          break;
      }
    }

    const handleDeleteRequest = (): void => {
      switch (userType) {
        case "player":
          break;
        case "enemy":
          authContext.room.send("deleteEnemy", { id: `${id}` });
          break;
        case "summon":
          authContext.room.send("deleteSummons", { id: +id });
          break;
      }
    }
    switch (toolContext.curTool) {
      case Tools.VISIBILITY:
        handleVisibilityRequest();
        break;
      case Tools.DELETE:
        handleDeleteRequest();
        break
    }
  }
  return determineVisibility() ? (
    <>
      <Pane name={`Free-${userType}-Marker-${id}`} style={{ zIndex: 500 }}>
        <MarkerDisplay
          name={name}
          avatarURI={userType === "player" ? avatarUri : `/colyseus/getImage/${avatarUri}`}
          color={color}
          position={position}
          size={calcSizeCategoryMultiplier()}
          health={health}
          totalHealth={totalHealth}
          className={isVisible ? "opacity-100" : "opacity-50"}
          statuses={statuses}
          isHovering={isHovering && !isMoving}
        />
      </Pane>
      <DistanceLine start={position} end={toPosition.length > 0 ? toPosition[0] : position} color={color} size={iconSize} />
      <Pane name={`Free-${userType}-Ghost-Marker-${id}`} style={{ zIndex: 501 }}>
        <MarkerDisplay
          name={name}
          avatarURI={userType === "player" ? avatarUri : `/colyseus/getImage/${avatarUri}`}
          color={color}
          position={toPosition[toPosition.length - 1]}
          size={calcSizeCategoryMultiplier()}
          isDraggable={true}
          className={`${isMoving ? "opacity-50" : "opacity-0"}`}
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
                onPositionChange(position)
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
