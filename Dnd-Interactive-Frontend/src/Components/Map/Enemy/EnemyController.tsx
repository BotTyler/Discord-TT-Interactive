import * as React from "react";
import L from "leaflet";
import EnemyMarker from "./EnemyMarkerRef";
import { mLatLng } from "dnd-interactive-shared";
import { Enemy } from "dnd-interactive-shared";
import { useGameState } from "../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";

/**
 * This class is meant to represent a single enemy.
 * @param enemy Instantiated Enemy class
 * @param size Size of the in px that the character should be.
 * @returns React Component used in the Interactive map of React-leaflet
 */
export default function EnemyController({ enemy }: { enemy: Enemy }) {
    const markerRef = React.useRef();
    const mapContext = useGameState();
    const authContext = useAuthenticatedContext();
    const [name, setName] = React.useState<string>(mapContext.getEnemy(enemy.id + "")!.name);
    const [position, setPosition] = React.useState<mLatLng>(mapContext.getEnemy(enemy.id + "")!.position);
    const [size, setSize] = React.useState<number>(mapContext.getEnemy(enemy.id + "")!.size);
    const [avatar, setAvatar] = React.useState<string>(mapContext.getEnemy(enemy.id + "")!.avatarUri);

    const [update, setUpdate] = React.useState<boolean>(false);

    React.useEffect(() => {
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
            setAvatar(value.detail.val);
        };

        window.addEventListener(`EnemyUpdate-${enemy.id}-name`, updateName);
        window.addEventListener(`EnemyUpdate-${enemy.id}-position`, updatePosition);
        window.addEventListener(`EnemyUpdate-${enemy.id}-size`, updateSize);
        window.addEventListener(`EnemyUpdate-${enemy.id}-avatarUri`, updateAvatar);

        const moveStatus = authContext.room.onMessage(`EnemyMovementConfirmation${enemy.id}`, (status: boolean) => {
            if (status) return;
            setUpdate((prev) => {
                return !prev;
            });
        });

        return () => {
            moveStatus();
            window.removeEventListener(`EnemyUpdate-${enemy.id}-name`, updateName);
            window.removeEventListener(`EnemyUpdate-${enemy.id}-position`, updatePosition);
            window.removeEventListener(`EnemyUpdate-${enemy.id}-size`, updateSize);
            window.removeEventListener(`EnemyUpdate-${enemy.id}-avatarUri`, updateAvatar);
        };
    }, []);
    return (
        <>
            <EnemyMarker id={enemy.id} name={name} playerAvatar={avatar} size={size} position={L.latLng(position.lat, position.lng)} key={`EnemyMovementMarkerController-${enemy.id}`} />
            {/* <DistanceLine MarkerRef={markerRef} size={size} color={"red"} key={`EnemyMovementLineController-${enemy.id}`} /> */}
        </>
    );
}
