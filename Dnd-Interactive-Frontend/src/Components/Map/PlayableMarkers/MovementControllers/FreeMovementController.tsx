import { LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import { useEffect, useRef, useState } from "react";
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

export default function FreeMovementController({ controllableUser, userType, onPositionChange, onGhostPositionChange }:
  { controllableUser: Player | Enemy | Summons; userType: "player" | "enemy" | "summon"; onPositionChange: (position: LatLng) => void; onGhostPositionChange: (position: LatLng[]) => void }) {
  const [markerUser, setMarkerUser] = useState<any>(controllableUser);

  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();
  const toolContext = useGameToolContext();

  const [id, setId] = useState<string>(markerUser.userId ?? markerUser.id);
  const [name, setName] = useState<string>(markerUser.name);
  const [avatarUri, setAvatarUri] = useState<string>(markerUser.avatarUri);
  const [markerSize, setMarkerSize] = useState<number>((markerUser as Enemy).size ?? mapContext.getIconHeight());
  const [iconSize, setIconSize] = useState<number>(mapContext.getIconHeight());
  const [position, setPosition] = useState<LatLng>(new LatLng(markerUser.position.lat, markerUser.position.lng));
  const [toPosition, setToPosition] = useState<LatLng[]>([position]);
  const [isConnected, setConnected] = useState<boolean>((markerUser as Player).isConnected ?? true);
  const [color, setColor] = useState<string>((markerUser as Player).color ?? "#f00");
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isVisible, setVisibility] = useState<boolean>((markerUser as Enemy).isVisible ?? true); // Only enemy visibility can change

  useEffect(() => {
    setMarkerUser(controllableUser);
  }, [controllableUser]);

  const isMovingRef = useRef(isMoving);
  useEffect(() => {
    isMovingRef.current = isMoving;
  }, [isMoving])

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
      setMarkerSize(value.detail.val);
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

    window.addEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
    window.addEventListener(`update-${tempUser.userId}-name`, handleNameChange);
    window.addEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
    window.addEventListener(`update-${tempUser.userId}-position`, setNewPosition);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`update-${tempUser.userId}-color`, handleColorChange);
    window.addEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
    return () => {
      window.removeEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
      window.removeEventListener(`update-${tempUser.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
      window.removeEventListener(`update-${tempUser.userId}-position`, setNewPosition);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`update-${tempUser.userId}-color`, handleColorChange);
      window.removeEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
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
      setMarkerSize(value.detail.val);
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

    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-isVisible`, handleVisibilityChange);
    return () => {
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-isVisible`, handleVisibilityChange);
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
      setMarkerSize(value.detail.val);
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

    window.addEventListener(`SummonUpdate-${tempSummon.id}-name`, updateName);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-position`, updatePosition);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-size`, updateSize);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-avatarUri`, updateAvatar);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-toPosition`, setNewToPosition);
    window.addEventListener(`SummonUpdate-${tempSummon.id}-isVisible`, handleVisibilityChange);
    return () => {
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-name`, updateName);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-position`, updatePosition);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-size`, updateSize);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-avatarUri`, updateAvatar);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-toPosition`, setNewToPosition);
      window.removeEventListener(`SummonUpdate-${tempSummon.id}-isVisible`, handleVisibilityChange);
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
          authContext.room.send("deleteSummons", { id: +id, player_id: markerUser.player_id });
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
          size={markerSize}
          className={isVisible ? "opacity-100" : "opacity-50"} />
      </Pane>
      <DistanceLine start={position} end={toPosition.length > 0 ? toPosition[0] : position} color={color} size={iconSize} />
      <Pane name={`Free-${userType}-Ghost-Marker-${id}`} style={{ zIndex: 501 }}>
        <MarkerDisplay name={name} avatarURI={userType === "player" ? avatarUri : `/colyseus/getImage/${avatarUri}`} color={color} position={toPosition[toPosition.length - 1] ?? position} size={markerSize}
          isDraggable={true}
          className={"opacity-50"}
          displayName={false}
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
          }} />
      </Pane>
    </>
  ) : <></>;
}
