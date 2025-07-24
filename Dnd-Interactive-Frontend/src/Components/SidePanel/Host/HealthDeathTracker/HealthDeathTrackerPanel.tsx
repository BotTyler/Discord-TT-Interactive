import { Enemy } from "../../../../../src/shared/Enemy"
import { Player } from "../../../../../src/shared/Player"
import { useEffect, useState } from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import HealthDeathTrackerElement from "../../General/HealthDeathTracker/HealthDeathTrackerElement";

export default function HealthDeathTrackerPanel() {
  const mapContext = useGameState();
  const playerContext = usePlayers();
  const authContext = useAuthenticatedContext();

  const [enemyList, setEnemyList] = useState<{ [key: string]: Enemy }>(mapContext.getEnemies());
  const [playerList, setPlayerList] = useState<{ [key: string]: Player }>(playerContext.getAllPlayers());

  useEffect(() => {
    const handleEnemyListChange = (val: any) => {
      setEnemyList(val.detail.val);
    };
    const handlePlayerListChange = (val: any) => {
      setPlayerList(val.detail.val);
    };

    window.addEventListener(`EnemiesChanged`, handleEnemyListChange);
    window.addEventListener(`PlayersChanged`, handlePlayerListChange);
    return () => {
      window.removeEventListener(`EnemiesChanged`, handleEnemyListChange);
      window.removeEventListener(`PlayersChanged`, handlePlayerListChange);
    };
  }, [authContext.room]);
  return (
    <div className="container-fluid h-100">
      <ul className="list-group">
        {Object.values(enemyList).map((val) => {
          return (
            <li className="list-group-item" key={`HealthDeathTrackerElement-Enemy-${val.id}`}>
              <HealthDeathTrackerElement item={val} isPlayer={false} />
            </li>
          );
        })}
        {Object.values(playerList).map((val) => {
          if (val.isHost) return <></>;
          return (
            <li className="list-group-item" key={`HealthDeathTrackerElement-Player-${val.userId}`}>
              <HealthDeathTrackerElement item={val} isPlayer={true} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
