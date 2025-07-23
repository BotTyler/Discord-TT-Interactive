import { Enemy } from "../../../../../shared/src/Enemy"
import { mLatLng } from "../../../../../shared/src/PositionInterface"
import React from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import EditEnemyModal from "../EditEnemyModal";

interface ParamInputs {
  enemy: Enemy;
}

/**
 * Component that describes what an enemy should look like in the host panel.
 * NOTE: This is not to be displayed on the interactive map and only within the host-panel itself.
 */
export default function EnemyListElement({ enemy }: ParamInputs) {
  // list of variables within the enemyList
  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
  const [id, setId] = React.useState<number>(enemy.id);
  const [avatarUri, setAvatarUri] = React.useState<string>(enemy.avatarUri);
  const [name, setName] = React.useState<string>(enemy.name);
  const [size, setSize] = React.useState<number>(enemy.size);
  const [position, setPosition] = React.useState<mLatLng>(enemy.position);
  const [totalHp, setTotalHp] = React.useState<number>(enemy.totalHealth);
  const [isEditingEnemy, setEditingEnemy] = React.useState<boolean>(false);

  React.useEffect(() => {
    const curEnemy = mapContext.getEnemy(id + "");
    if (curEnemy === undefined) return;

    const handleAvatarChange = (value: any) => {
      setAvatarUri(value.detail.val);
    };

    const handleNameChange = (value: any) => {
      setName(value.detail.val);
    };

    const handleSizeChange = (value: any) => {
      setSize(value.detail.val);
    };

    const handlePositionChange = (value: any) => {
      setPosition(value.detail.val);
    };

    const handleTotalHpChange = (value: any) => {
      setTotalHp(value.detail.val);
    };
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-avatarUri`, handleAvatarChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-name`, handleNameChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-size`, handleSizeChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-position`, handlePositionChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-totalHealth`, handleTotalHpChange);

    return () => {
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-avatarUri`, handleAvatarChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-name`, handleNameChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-size`, handleSizeChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-position`, handlePositionChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-totalHealth`, handleTotalHpChange);
    };
  }, []);

  const handleEditCallback = () => {
    //show modal
    setEditingEnemy(true);
    // Send the data
  };

  const handleDuplicateCallback = () => {
    authContext.room.send("addEnemy", {
      avatarUri: avatarUri,
      name: name,
      position: position,
      size: size,
      totalHealth: totalHp,
    });
  };
  const handleDeleteCallback = (id: number) => {
    authContext.room.send("deleteEnemy", { id: `${id}` });
  };
  return (
    <li className={`list-group-item`}>
      <div className="container-fluid m-0 p-0 overflow-hidden" style={{ minWidth: "300px" }}>
        {/* name */}
        <div className="text-center w-100">
          <p className="fs-6 m-0">{name}</p>
        </div>
        <div className="row  g-1 text-center align-items-center justify-content-center">
          {/* img */}
          <div className="col-2 p-0">
            <img className="img-fluid" src={`/colyseus/getImage/${avatarUri}`} onClick={() => handleEditCallback()} style={{ maxHeight: "50px" }} />
          </div>

          {/* Place button */}
          <div className="col-1">
            <button className="btn btn-primary w-100 p-0" onClick={() => handleEditCallback()}>
              E
            </button>
          </div>
          {/* Duplicate button */}
          <div className="col-1">
            <button className="btn btn-primary w-100 p-0" onClick={() => handleDuplicateCallback()}>
              D
            </button>
          </div>
          {/* Remove */}
          <div className="col-1">
            <button className="btn btn-danger w-100 p-0" onClick={() => handleDeleteCallback(enemy.id)}>
              X
            </button>
          </div>
          <div className="col-6">
            <p className="fs-6 m-0">{totalHp} THP</p>
          </div>
        </div>
      </div>
      {isEditingEnemy ? (
        <EditEnemyModal
          callback={(data) => {
            if (data === undefined) {
              setEditingEnemy(false);
              return;
            }
            authContext.room.send("updateEnemy", {
              id: enemy.id + "",
              name: data.name,
              size: data.size,
              avatarUri: data.avatarUri,
              totalHealth: data.hp,
            });
            setEditingEnemy(false);
            return;
          }}
          enemyname={name}
          enemysize={size}
          enemyavatarUri={avatarUri}
          totalHp={totalHp}
          key={`EditEnemyModal-${enemy.id}`}
        />
      ) : (
        ""
      )}
    </li>
  );
}
