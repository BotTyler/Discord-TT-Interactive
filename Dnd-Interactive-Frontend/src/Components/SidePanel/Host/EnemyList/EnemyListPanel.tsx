import React from "react";

import { Enemy, mLatLng } from "dnd-interactive-shared";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import EditEnemyModal from "../EditEnemyModal";
import EnemyListElement from "./EnemyListElement";
import PlayerSizeInput from "./PlayerSizeInput";

/**
 * Component that will display the list of enemies and anything else only the host will need.
 */
export default function EnemyListPanel() {
  // const list = [{ name: "name 1 something", img: "/Assets/placeholder.png", size: 25 }, { name: "name 1 something", img: "/Assets/placeholder.png", size: 25 }, , { name: "name 1 something", img: "/Assets/placeholder.png", size: 25 }];
  const [isAddingEnemy, setIsAddingEnemy] = React.useState<boolean>(false);
  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
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
      {/* Player Size */}
      <div className="w-100">
        <PlayerSizeInput />
      </div>
      {/* Enemy List */}
      <ul className="list-group">
        {Object.keys(enemyList).map((enemyKey) => {
          return <EnemyListElement enemy={enemyList[enemyKey]} key={`EnemyListElement-${enemyKey}`} />;
        })}
      </ul>
      <div className="w-100 d-flex justify-content-center mt-1" style={{ height: "40px" }}>
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
        <EditEnemyModal
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
          enemyavatarUri={""}
          enemyname=""
          enemysize={25}
          totalHp={1}
          key={`AddEnemyModal`}
        />
      ) : (
        ""
      )}
    </>
  );
}
