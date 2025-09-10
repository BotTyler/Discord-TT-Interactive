import { Enemy } from "../../../../shared/Enemy";
import React, { useState } from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import GridMovementController from "../MovementControllers/GridMovementController";
import { MapMovementType } from "../../../../shared/State";
import FreeMovementController from "../MovementControllers/FreeMovementController";
import { LatLng } from "leaflet";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { throttle } from "lodash";

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
  function getControllerElement(enemy: Enemy): any {
    const handlePositionChanged = (toPosition: LatLng): void => {
      authContext.room.send("updateEnemyPosition", { pos: toPosition, clientToChange: enemy.id + "" });
    }

    const handleGhostPositionChange = (toPosition: LatLng[]) => {
      makeGhostRequest(toPosition);
    };

    const makeGhostRequest = (toPosition: LatLng[]): void => {
      switch(movementType){
        case "free":
          authContext.room.send("updateEnemyGhostPosition", {pos: toPosition, clientToChange: enemy.id + ""});
        break;
        case "grid":
          authContext.room.send("updateEnemyGhostPosition", {pos: toPosition, clientToChange: enemy.id + ""})
        break;
        default:
          authContext.room.send("updateEnemyGhostPosition", {pos: toPosition, clientToChange: enemy.id + ""});
        break;
      }
    }
    

    switch (movementType) {
      case "free":
        return <FreeMovementController isPlayer={false} controllableUser={enemy} onPositionChange={handlePositionChanged} onGhostPositionChange={handleGhostPositionChange} />;
      case "grid":
        return <GridMovementController isPlayer={false} controllableUser={enemy} onPositionChange={handlePositionChanged} onGhostPositionChange={handleGhostPositionChange} />;
      default:
        return <FreeMovementController isPlayer={false} controllableUser={enemy} onPositionChange={handlePositionChanged} onGhostPositionChange={handleGhostPositionChange} />;
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
