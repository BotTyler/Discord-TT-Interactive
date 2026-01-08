import { Enemy } from "../../../../shared/Enemy";
import React, { useState } from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import GridMovementController from "../MovementControllers/GridMovementController";
import { MapMovementType } from "../../../../shared/State";
import FreeMovementController from "../MovementControllers/FreeMovementController";
import { LatLng } from "leaflet";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import useDebounced from "../../../../Util/useDebounced";

/**
 * Class that handles all registered enemies and displays their controllers on the interactive react-leaflet map.
 * @returns React Component to be used within a leaflet map
 *
 */
export default function EnemyMarkerList() {
  const authContext = useAuthenticatedContext();
  const mapContext = useGameState();
  const gameStateContext = useGameState();
  const [enemyList, setEnemyList] = useState<{ [key: string]: Enemy }>(mapContext.getEnemies());
  const [movementType, setMovementType] = useState<MapMovementType>(gameStateContext.getMapMovement());

  React.useEffect(() => {
    const handleEnemyListUpdate = (value: any) => {
      setEnemyList(value.detail.val);
    };
    const MovementTypeChanged = (value: any) => {
      setMovementType(value.detail.val);
    };

    window.addEventListener(`EnemiesChanged`, handleEnemyListUpdate);
    window.addEventListener("MapMovementChanged", MovementTypeChanged);

    return () => {
      window.removeEventListener(`EnemiesChanged`, handleEnemyListUpdate);
      window.removeEventListener("MapMovementChanged", MovementTypeChanged);
    };
  }, []);



  // Debounce needs to be defined outside the class.
  const debouncePositionChange = useDebounced((enemy: Enemy, toPosition: LatLng) => {
    authContext.room.send("updateEnemyPosition", { pos: toPosition, clientToChange: enemy.id + "" });
  }, 100)

  const debounceGhostPositionChange = useDebounced((enemy: Enemy, toPosition: LatLng[]) => {
    // switch(movementType){
    //   case "free":
    //     authContext.room.send("updateEnemyGhostPosition", {pos: toPosition, clientToChange: enemy.id + ""});
    //   break;
    //   case "grid":
    //     authContext.room.send("updateEnemyGhostPosition", {pos: toPosition, clientToChange: enemy.id + ""})
    //   break;
    //   default:
    //     authContext.room.send("updateEnemyGhostPosition", {pos: toPosition, clientToChange: enemy.id + ""});
    //   break;
    // }
    authContext.room.send("updateEnemyGhostPosition", { pos: toPosition, clientToChange: enemy.id + "" });
  }, 100)

  function getControllerElement(enemy: Enemy): any {

    switch (movementType) {
      case "free":
        return <FreeMovementController userType="enemy" controllableUser={enemy}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(enemy, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(enemy, toPosition) }} />;
      case "grid":
        return <GridMovementController userType="enemy" controllableUser={enemy}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(enemy, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(enemy, toPosition) }} />;
      default:
        return <FreeMovementController userType="enemy" controllableUser={enemy}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(enemy, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(enemy, toPosition) }} />;
    }
  }

  return (
    <>
      {Object.keys(enemyList).map((key) => {
        // return <EnemyController enemy={mapContext.getEnemy(key)!} key={`EnemyController-${key}`} />;
        return <div key={`EnemyController-${key}`}>{getControllerElement(mapContext.getEnemy(key)!)}</div>
      })}
    </>
  );
}
