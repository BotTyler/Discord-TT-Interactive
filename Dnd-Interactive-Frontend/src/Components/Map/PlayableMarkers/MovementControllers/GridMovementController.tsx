import { useCallback, useEffect, useState } from "react";
import { Enemy } from "../../../../shared/Enemy";
import { Player } from "../../../../shared/Player";
import MarkerDisplay from "../MarkerDisplay";
import { LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import DistanceLine from "../DistanceLine";
import { Pane, useMapEvents } from "react-leaflet";
import { MapData } from "../../../../shared/Map";
import { mLatLng } from "../../../../shared/PositionInterface";
import { UUID } from "crypto";

export default function GridMovementController({ controllableUser, isPlayer, onPositionChange, onGhostPositionChange }:
    { controllableUser: Player | Enemy; isPlayer: boolean; onPositionChange: (position: LatLng) => void; onGhostPositionChange: (position: LatLng[]) => void }) {
    const [markerUser, setMarkerUser] = useState(controllableUser);

    const mapContext = useGameState();

    const [randomId, setRandomId] = useState<UUID>(crypto.randomUUID());
    const [name, setName] = useState<string>(markerUser.name);
    const [avatarUri, setAvatarUri] = useState<string>(markerUser.avatarUri);
    const [position, setPosition] = useState<LatLng>(new LatLng(markerUser.position.lat, markerUser.position.lng));
    const [toPosition, setToPosition] = useState<LatLng[]>([position]);
    const [iconSize, setSize] = useState<number>(mapContext.getIconHeight());
    const [isConnected, setConnected] = useState<boolean>((markerUser as Player).isConnected ?? true);
    const [color, setColor] = useState<string>((markerUser as Player).color ?? "#f00");
    const [isMoving, setIsMoving] = useState<boolean>(false);

    // use the map like this may be dangerous, but this component does not load until the map is set.
    const [mapWidth, setMapWidth] = useState<number>(mapContext.getMap()!.width);
    const [mapHeight, setMapHeight] = useState<number>(mapContext.getMap()!.height);

    const calculateNearestcenter = useCallback((position: LatLng): LatLng => {
        const centerXIndex: number = Math.floor(position.lng / iconSize);
        const centerYIndex: number = Math.floor(position.lat / iconSize);

        const halfIcon = iconSize / 2;
        const xval: number = (centerXIndex * iconSize) + halfIcon;
        const yval: number = (centerYIndex * iconSize) + halfIcon;
        return new LatLng(yval, xval);

    }, [mapWidth, mapHeight, iconSize]);

    useEffect(() => {
        setMarkerUser(controllableUser);
    }, [controllableUser]);

    useEffect(()=>{
        if (!isPlayer) return;
        const tempUser: Player = markerUser as Player;
        const setNewToPosition = (value: any) => {
            // Ignore this update if this object is currently moving.
            if (!isMoving)
                setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any)=>{return new LatLng(val.lat, val.lng)}));
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
            setSize(value.detail.val);
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
        }


        window.addEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
        window.addEventListener(`update-${tempUser.userId}-name`, handleNameChange);
        window.addEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
        window.addEventListener(`update-${tempUser.userId}-position`, setNewPosition);
        window.addEventListener(`update-${tempUser.userId}-color`, handleColorChange);
        window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
        window.addEventListener(`MapUpdate`, handleMapUpdate);

        return () => {
            window.removeEventListener(`update-${tempUser.userId}-isConnected`, handleConnectionChange);
            window.removeEventListener(`update-${tempUser.userId}-name`, handleNameChange);
            window.removeEventListener(`update-${tempUser.userId}-avatarUri`, handleAvatarUriChange);
            window.removeEventListener(`update-${tempUser.userId}-position`, setNewPosition);
            window.removeEventListener(`update-${tempUser.userId}-color`, handleColorChange);
            window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
            window.removeEventListener(`MapUpdate`, handleMapUpdate);
        }

    }, [markerUser]);

    useEffect(() => {
        setPosition((prev) => {
            // ensure position is set to the nearest
            const centeredPos: LatLng = calculateNearestcenter(prev);
            onPositionChange(centeredPos);
            return centeredPos;
        })
    }, [])

    useEffect(()=>{
        if (isPlayer) return;
        const tempEnemy: Enemy = markerUser as Enemy;
        const setNewToPosition = (value: any) => {
            // Ignore this update if this object is currently moving.
            if (!isMoving)
                setToPosition(value.detail.val == null ? [position] : value.detail.val.map((val: any)=>{return new LatLng(val.lat, val.lng)}));
        };
        window.addEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);

        return () => {
            window.removeEventListener(`EnemyUpdate-${tempEnemy.id}-toPosition`, setNewToPosition);
        }
    }, [isMoving]);

    useEffect(() => {
        // setup listeners for the player.
        if (isPlayer) return;
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
            setAvatarUri(value.detail.val);
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
            setToPosition((prev)=>{
                const calcCenter: LatLng = calculateNearestcenter(event.latlng);
                if(prev.length > 0){
                    const last: LatLng = prev[prev.length - 1];
                    if(last.equals(calcCenter)){
                        return [...prev];
                    }
                }
                const result = [...prev, calcCenter];
                onGhostPositionChange(result);
                return result;
            })
        }
    })

    return (
        <>
            <Pane name={`Grid-Player-Marker-${randomId}`} style={{ zIndex: 500 }}>
                <MarkerDisplay name={name} avatarURI={isPlayer? avatarUri: `/colyseus/getImage/${avatarUri}`} color={color} position={position} size={iconSize} className="" />
            </Pane>
            {/* <DistanceLine start={position} end={toPosition} color={color} size={iconSize} /> */}
            {toPosition.map((val: LatLng, index : number)=>{
                return <DistanceLine start={index === 0? position:toPosition[index - 1]} end={val} color={color} size={iconSize} showDistance={false} key={`Grid-Player-DistanceLine-${randomId}-${index}`}/>
            })}
            <Pane name={`Grid-Player-Ghost-Marker-${randomId}`} style={{ zIndex: 501 }}>
                <MarkerDisplay name={name} avatarURI={isPlayer? avatarUri: `/colyseus/getImage/${avatarUri}`} color={color} position={toPosition[toPosition.length - 1] ?? position} size={iconSize}
                    isDraggable={true}
                    className={`${isMoving ? "opacity-50" : "opacity-50"}`}
                    displayName={false}
                    eventFunctions={{
                        dragstart: (event: LeafletEvent) => {
                            setIsMoving(true);
                        },
                        mouseup: (event: LeafletMouseEvent) => {
                            if(event.originalEvent.button === 0) { // LMB press
                                setIsMoving(false);
                                onPositionChange(event.latlng);
                                setToPosition([new LatLng(position.lat, position.lng)]);
                            }else{
                                // Cancel request
                                setIsMoving(false);
                                onPositionChange(position);
                                setToPosition([new LatLng(position.lat, position.lng)]);
                            }
                        }
                    }} />
            </Pane>
        </>
    )
}