import { useEffect, useState } from "react";
import { Enemy } from "../../../../../src/shared/Enemy";
import { Player } from "../../../../../src/shared/Player";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import HealthDeathTrackerElement from "../../General/HealthDeathTracker/HealthDeathTrackerElement";
import EditCharacterModal from "../../../Modal/SummonedCharacterModal";
import { mLatLng } from "../../../../shared/PositionInterface";

export default function HealthDeathTrackerPanel() {
  const mapContext = useGameState();
  const playerContext = usePlayers();
  const authContext = useAuthenticatedContext();

  const [isAddingEnemy, setIsAddingEnemy] = useState<boolean>(false);
  const [enemyList, setEnemyList] = useState<{ [key: string]: Enemy }>(mapContext.getEnemies());
  // const [playerList, setPlayerList] = useState<{ [key: string]: Player }>(playerContext.getAllPlayers());

  useEffect(() => {
    const handleEnemyListChange = (val: any) => {
      setEnemyList(val.detail.val);
    };
    // const handlePlayerListChange = (val: any) => {
    //   setPlayerList(val.detail.val);
    // };

    window.addEventListener(`EnemiesChanged`, handleEnemyListChange);
    // window.addEventListener(`PlayersChanged`, handlePlayerListChange);
    return () => {
      window.removeEventListener(`EnemiesChanged`, handleEnemyListChange);
      // window.removeEventListener(`PlayersChanged`, handlePlayerListChange);
    };
  }, [authContext.room]);
  return (
    <>
      <div className="container-fluid p-0 h-100">
        <ul className="list-group gap-1">
          {Object.values(enemyList).map((val) => {
            return (
              <li className="list-group-item p-0" key={`HealthDeathTrackerElement-Enemy-${val.id}`}>
                <HealthDeathTrackerElement
                  item={val}
                  itemType="enemy"
                />
              </li>
            );
          })}
        </ul>
        <button
          className="btn btn-primary p-1 m-0 g-0 w-100"
          onClick={() => {
            setIsAddingEnemy(true);
          }}
        >
          Add Enemy
        </button>
      </div>
      {isAddingEnemy ? (
        <EditCharacterModal
          callback={(data) => {
            if (data !== undefined) {
              authContext.room.send("addEnemy", {
                avatarUri: data.avatarUri,
                name: data.name,
                position: new mLatLng(0, 0),
                size: data.size,
                totalHealth: data.hp,
              });
            }
            setIsAddingEnemy(false);
            return;
          }}
          title="Enemy Add"
          avatarUri={""}
          name=""
          size={25}
          totalHp={1}
          key={`AddEnemyModal`}
        />
      ) : (
        ""
      )}
    </>
  );
}
