import React from "react";
import { Enemy } from "dnd-interactive-shared";
import { useGameState } from "../../../ContextProvider/GameStateContext/GameStateProvider";
import EnemyController from "./EnemyController";

/**
 * Class that handles all registered enemies and displays their controllers on the interactive react-leaflet map.
 * @returns React Component to be used within a leaflet map
 *
 */
export default function EnemyMarkerList() {
  const mapContext = useGameState();
  const [enemyList, setEnemyList] = React.useState<{ [key: string]: Enemy }>(mapContext.getEnemies());

  React.useEffect(() => {
    const handleEnemyListUpdate = (value: any) => {
      setEnemyList(value.detail.val);
    };
    window.addEventListener(`EnemiesChanged`, handleEnemyListUpdate);
    return () => {
      window.removeEventListener(`EnemiesChanged`, handleEnemyListUpdate);
    };
  }, []);

  return (
    <>
      {Object.keys(enemyList).map((key) => {
        return <EnemyController enemy={mapContext.getEnemy(key)!} key={`EnemyController-${key}`} />;
      })}
    </>
  );
}
