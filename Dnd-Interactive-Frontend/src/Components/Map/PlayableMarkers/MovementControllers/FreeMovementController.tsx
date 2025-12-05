import { useEffect, useState } from "react";
import { Enemy } from "../../../../shared/Enemy";
import { Player } from "../../../../shared/Player";
import MarkerDisplay from "../MarkerDisplay";
import { LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { Pane, useMapEvents } from "react-leaflet";
import DistanceLine from "../DistanceLine";

export default function FreeMovementController({ controllableUser, isPlayer, onPositionChange, onGhostPositionChange }:
  { controllableUser: Player | Enemy; isPlayer: boolean; onPositionChange: (position: LatLng) => void; onGhostPositionChange: (position: LatLng[]) => void }) {
  const [markerUser, setMarkerUser] = useState<any>(controllableUser);

  const mapContext = useGameState();

  const [id, setId] = useState<string>(markerUser.userId ?? markerUser.id);
  const [name, setName] = useState<string>(markerUser.name);
  const [avatarUri, setAvatarUri] = useState<string>(markerUser.avatarUri);
  // const [markerSize, setMarkerSize] = useState<number>(isPlayer ? mapContext.getIconHeight() : (markerUser as Enemy).size);
  const [markerSize, setMarkerSize] = useState<number>((markerUser as Enemy).size ?? mapContext.getIconHeight());
  const [iconSize, setIconSize] = useState<number>(mapContext.getIconHeight());
  const [position, setPosition] = useState<LatLng>(new LatLng(markerUser.position.lat, markerUser.position.lng));
  const [toPosition, setToPosition] = useState<LatLng[]>([position]);
  const [isConnected, setConnected] = useState<boolean>((markerUser as Player).isConnected ?? true);
  const [color, setColor] = useState<string>((markerUser as Player).color ?? "#f00");
  const [isMoving, setIsMoving] = useState<boolean>(false);

  useEffect(() => {
    setMarkerUser(controllableUser);
  }, [controllableUser]);



  useEffect(() => {
    // Set player listeners
    if (!isPlayer) return;

    const tempUser: Player = markerUser as Player;
    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMoving) {
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
      }
    };
    window.addEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
    return () => {
      window.removeEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
    }
  }, [isMoving]);

  useEffect(() => {
    // setup listeners for the player.
    if (!isPlayer) return;

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

    window.addEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
    window.addEventListener(`update-${tempUser.userId}-name`, handleNameChange);
    window.addEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
    window.addEventListener(`update-${tempUser.userId}-position`, setNewPosition);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`update-${tempUser.userId}-color`, handleColorChange);

    return () => {
      window.removeEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
      window.removeEventListener(`update-${tempUser.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
      window.removeEventListener(`update-${tempUser.userId}-position`, setNewPosition);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`update-${tempUser.userId}-color`, handleColorChange);
    }

  }, [markerUser]);


  useEffect(() => {
    // Setup listeners for an enemy.
    if (isPlayer) return;
    const tempEnemy: Enemy = markerUser as Enemy;

    const setNewToPosition = (value: any) => {
      // Ignore this update if this object is currently moving.
      if (!isMoving) {
        setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any) => { return new LatLng(val.lat, val.lng) }));
      }
    };
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
    return () => {
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
    }
  }, [isMoving]);

  useEffect(() => {
    // setup listeners for the Enemy.
    if (isPlayer) return;

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

    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
    return () => {
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
      window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
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

  return (
    <>
      <Pane name={`Free-Player-Marker-${id}`} style={{ zIndex: 500 }}>
        <MarkerDisplay name={name} avatarURI={isPlayer ? avatarUri : `/colyseus/getImage/${avatarUri}`} color={color} position={position} size={markerSize} className="" />
      </Pane>
      <DistanceLine start={position} end={toPosition.length > 0 ? toPosition[0] : position} color={color} size={iconSize} />
      <Pane name={`Free-Player-Ghost-Marker-${id}`} style={{ zIndex: 501 }}>
        <MarkerDisplay name={name} avatarURI={isPlayer ? avatarUri : `/colyseus/getImage/${avatarUri}`} color={color} position={toPosition[toPosition.length - 1] ?? position} size={markerSize}
          isDraggable={true}
          className={`${isMoving ? "opacity-50" : "opacity-50"}`}
          displayName={false}
          eventFunctions={{
            dragstart: (event: LeafletEvent) => {
              setIsMoving(true);
            },
            mouseup: (event: LeafletMouseEvent) => {
              if (event.originalEvent.button === 0) { // LMB press
                setIsMoving(false);
                onPositionChange(event.latlng);
                setToPosition([new LatLng(position.lat, position.lng)]);
              } else {
                // Cancel request
                setIsMoving(false);
                onPositionChange(position)
                setToPosition([new LatLng(position.lat, position.lng)]);
              }
            }
          }} />
      </Pane>
    </>
  )
}
