import { useEffect, useState } from "react";
import { Enemy } from "../../../../shared/Enemy";
import { Player } from "../../../../shared/Player";
import MarkerDisplay from "../MarkerDisplay";
import { LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import DistanceLine from "../DistanceLine";
import { useMapEvents } from "react-leaflet";

export default function FreeMovementController({ controllableUser, isPlayer, onPositionChange }: { controllableUser: Player | Enemy; isPlayer: boolean;  onPositionChange:(position: LatLng)=>void }) {
    const [markerUser, setMarkerUser] = useState(controllableUser);

    const mapContext = useGameState();

    const [name, setName] = useState<string>(markerUser.name);
    const [avitarUri, setAvitarUri] = useState<string>(markerUser.avatarUri);
    const [position, setPosition] = useState<LatLng>(new LatLng(markerUser.position.lat, markerUser.position.lng));
    const [toPosition, setToPosition] = useState<LatLng>(new LatLng(markerUser.position.lat, markerUser.position.lng));
    const [iconSize, setSize] = useState<number>(mapContext.getIconHeight());
    const [isConnected, setConnected] = useState<boolean>((markerUser as Player).isConnected ?? true);
    const [color, setColor] = useState<string>((markerUser as Player).color ?? "#f00");
    const [isHost, setIsHost] = useState<boolean>((markerUser as Player).isHost ?? false);
    const [isMoving, setIsMoving] = useState<boolean>(false);

    useEffect(() => {
        setMarkerUser(controllableUser);
    }, [controllableUser]);

    useEffect(() => {
        // setup listeners for the player.

        if (!isPlayer) return;
        const tempUser: Player = markerUser as Player;

        const setNewPosition = (value: any) => {
            setPosition(value.detail.val);
            setToPosition(value.detail.val);
        };
        const handleAvatarUriChange = (value: any) => {
            setAvitarUri(value.detail.val);
        }
        const setNewToPosition = (value: any) => {
            // Ignore this update if this object is currently moving.
            if(isMoving)
                setToPosition(value.detail.val == null? position : value.detail.val);
        };
        const handleNameChange = (value: any) => {
            setName(value.detail.val);
        }
        const handleIconHeightChange = (value: any) => {
            setSize(value.detail.val);
        };
        const handleConnectionChange = (value: any) => {
            setConnected(value.detail.val);
        };
        const handleColorChange = (value: any) => {
            setColor(value.detail.val);
        };
        const handleIsHostChange = (value: any) => {
            setIsHost(value.detail.val);
        };


        window.addEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
        window.addEventListener(`update-${tempUser.userId}-name`, handleNameChange);
        window.addEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
        window.addEventListener(`update-${tempUser.userId}-position`, setNewPosition);
        window.addEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
        window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
        window.addEventListener(`update-${tempUser.userId}-color`, handleColorChange);
        window.addEventListener(`update-${tempUser.userId}-isHost`, handleIsHostChange);

        return () => {
            window.removeEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
            window.removeEventListener(`update-${tempUser.userId}-name`, handleNameChange);
            window.removeEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
            window.removeEventListener(`update-${tempUser.userId}-position`, setNewPosition);
            window.removeEventListener(`update-${tempUser.userId}-toPosition`, setNewToPosition);
            window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
            window.removeEventListener(`update-${tempUser.userId}-color`, handleColorChange);
            window.removeEventListener(`update-${tempUser.userId}-isHost`, handleIsHostChange);
        }

    }, [markerUser]);

    useEffect(() => {
        // setup listeners for the player.
        if (isPlayer) return;
        console.warn("ENEMY INSTANCE")
        const tempEnemy: Enemy = markerUser as Enemy;

        const updateName = (value: any) => {
            setName(value.detail.val);
        }

        const updatePosition = (value: any) => {
            setPosition(value.detail.val);
        };
        const updateSize = (value: any) => {
            setSize(value.detail.val);
        };

        const updateAvatar = (value: any) => {
            setAvitarUri(value.detail.val);
        };

        window.addEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
        window.addEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
        window.addEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
        window.addEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
        return () => {
            window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-name`, updateName);
            window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-position`, updatePosition);
            window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-size`, updateSize);
            window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-avatarUri`, updateAvatar);
        }

    }, [markerUser]);

    useMapEvents({
        mousemove: (event: LeafletMouseEvent) => {
            if (!isMoving) return;
            setToPosition(event.latlng);
        }
    })

    return (
        <>
            <MarkerDisplay name={name} avatarURI={avitarUri} color={color} position={position} size={iconSize} className="" />
            <DistanceLine start={position} end={toPosition} color={color} size={iconSize} />
            <MarkerDisplay name={name} avatarURI={avitarUri} color={color} position={toPosition} size={iconSize}
                isDraggable={true}
                className={`${isMoving? "opacity-50":"opacity-0"}`}
                displayName={false}
                eventFunctions={{
                    dragstart: (event: LeafletEvent) => {
                        setIsMoving(true);
                    },
                    mouseup: (event: LeafletMouseEvent) => {
                        setIsMoving(false);
                        setToPosition((prev) => {
                            onPositionChange(prev);
                            return position;
                        });
                    }
                }} />
        </>
    )
}