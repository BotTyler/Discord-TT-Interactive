import { Enemy } from "../../../../../src/shared/Enemy"
import { mLatLng } from "../../../../../src/shared/PositionInterface"
import React from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import EditCharacterModal from "../../../Modal/SummonedCharacterModal";

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
  const [health, setHealth] = React.useState<number>(enemy.health);
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

    const handleHpChange = (value: any) => {
      setHealth(value.detail.val);
    };

    const handleTotalHpChange = (value: any) => {
      setTotalHp(value.detail.val);
    };

    window.addEventListener(`EnemyUpdate-${curEnemy.id}-avatarUri`, handleAvatarChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-name`, handleNameChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-size`, handleSizeChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-position`, handlePositionChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-health`, handleHpChange);
    window.addEventListener(`EnemyUpdate-${curEnemy.id}-totalHealth`, handleTotalHpChange);

    return () => {
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-avatarUri`, handleAvatarChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-name`, handleNameChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-size`, handleSizeChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-position`, handlePositionChange);
      window.removeEventListener(`EnemyUpdate-${curEnemy.id}-health`, handleHpChange);
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
  const handleDeleteCallback = () => {
    authContext.room.send("deleteEnemy", { id: `${enemy.id}` });
  };
  const handleVisibilityToggle = (): void => {
    authContext.room.send("toggleEnemyVisibility", { clientToChange: `${enemy.id}` })
  }

  return (
    <li className={`list-group-item`}>

      <div className="row m-0 p-0 overflow-hidden" style={{ minWidth: "300px" }}>
        <div className="col-3" style={{ cursor: "pointer" }}>
          <img className="img-fluid" src={`/colyseus/getImage/${avatarUri}`} onClick={() => handleEditCallback()} style={{ maxHeight: "50px" }} />
        </div>
        <div className="col-5 text-center">
          <p className="m-0 fs-6">{name}</p>
          <p className="m-0 fs-6">{totalHp} THP</p>
        </div>
        <div className="col-4 d-flex justify-content-center align-items-center">
          <div className="row gap-1">
            {/* Place button */}
            <button className="col-1 btn btn-primary w-auto h-auto p-1" onClick={() => handleEditCallback()}>
              <i className="bi bi-pencil-square"></i>
            </button>
            {/* Duplicate button */}
            <button className="col-1 btn btn-primary w-auto h-auto p-1" onClick={() => handleDuplicateCallback()}>
              <i className="bi bi-copy"></i>
            </button>
            {/* Visibility */}
            <button className="col-1 btn btn-primary w-auto h-auto p-1" onClick={() => handleVisibilityToggle()}>
              <i className="bi bi-eye"></i>
            </button>
            {/* Remove */}
            <button className="col-1 btn btn-danger w-auto h-auto p-1" onClick={() => handleDeleteCallback()}>
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      {isEditingEnemy ? (
        <EditCharacterModal
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
              health: health,
              totalHealth: data.hp,
            });
            setEditingEnemy(false);
            return;
          }}
          title="Enemy Edit"
          name={name}
          size={size}
          avatarUri={avatarUri}
          totalHp={totalHp}
          key={`EditEnemyModal-${enemy.id}`}
        />
      ) : (
        ""
      )}
    </li>
  );
}
