import { useEffect, useState } from "react";
import { Enemy } from "../../../../../src/shared/Enemy";
import { Player } from "../../../../../src/shared/Player";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { Summons } from "../../../../shared/Summons";
import EditCharacterModal from "../../../Modal/SummonedCharacterModal";
import { ProgressDiv } from "../../../ProgressBar/ProgressBarComponent";
import DeathComponent from "./DeathComponent";
import HealthNamePlate, { HealDamageComponent } from "./HealthComponent";
import { mLatLng } from "../../../../shared/PositionInterface";
import StatusDropdown from "../../../StatusModal/StatusModal";
import { CharacterStatus } from "../../../../shared/StatusTypes";
import { MARKER_SIZE_CATEGORIES } from "../../../../shared/MarkerOptions";

export default function HealthDeathTrackerElement({ item, itemType }:
  {
    item: Player | Enemy | Summons;
    itemType: "player" | "enemy" | "summons";
  }) {
  const authContext = useAuthenticatedContext();
  const gamestate = useGameState();

  const [id, setId] = useState<any>((item as Player).userId ?? (item as Enemy | Summons).id);
  const [name, setName] = useState<string>(item.name);
  const [size_category, setSizeCategory] = useState<MARKER_SIZE_CATEGORIES>((item as Enemy | Summons).size_category ?? "MEDIUM");
  const [avatarUri, setUri] = useState<string>(item.avatarUri);
  const [health, setHealth] = useState<number>(item.health);
  const [totalHealth, setTotalHealth] = useState<number>(item.totalHealth);
  const [deathSaves, setDeathSaves] = useState<number>(item.deathSaves);
  const [lifeSaves, setLifeSaves] = useState<number>(item.lifeSaves);
  const [isVisible, setVisibility] = useState<boolean>((item as Enemy | Summons).isVisible ?? true);
  const [statuses, setStatuses] = useState<CharacterStatus[]>(item.statuses);

  const [showEditCharacter, setShowEditCharacter] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  useEffect(() => {
    // const updateString = itemType === "player" ? `update-${(item as Player).userId}` : `EnemyUpdate-${(item as Enemy).id}`;
    let updateString: string = "";
    switch (itemType) {
      case "player":
        updateString = `update-${(item as Player).userId}`
        break;
      case "enemy":
        updateString = `EnemyUpdate-${(item as Enemy).id}`
        break;
      case "summons":
        updateString = `SummonUpdate-${(item as Summons).id}`
        break;
    }

    const handleNameChange = (val: any) => {
      setName(val.detail.val);
    };

    const handleImageChange = (val: any) => {
      setUri(val.detail.val);
    };

    const handleHealthChange = (val: any) => {
      setHealth(val.detail.val);
    };

    const handleTotalHealthChange = (val: any) => {
      setTotalHealth(val.detail.val);
    };

    const handleDeathSavesChange = (val: any) => {
      setDeathSaves(val.detail.val);
    };

    const handleLifeSavesChange = (val: any) => {
      setLifeSaves(val.detail.val);
    };

    const handleSizeChange = (val: any) => {
      setSizeCategory(val.detail.val);
    }

    const handleVisibilityChange = (val: any) => {
      setVisibility(val.detail.val)
    }

    const handleStatusChange = (val: any) => {
      setStatuses(val.detail.val);
    }

    window.addEventListener(`${updateString}-name`, handleNameChange);
    window.addEventListener(`${updateString}-avatarUri`, handleImageChange);
    window.addEventListener(`${updateString}-health`, handleHealthChange);
    window.addEventListener(`${updateString}-totalHealth`, handleTotalHealthChange);
    window.addEventListener(`${updateString}-deathSaves`, handleDeathSavesChange);
    window.addEventListener(`${updateString}-lifeSaves`, handleLifeSavesChange);
    window.addEventListener(`${updateString}-size`, handleSizeChange);
    window.addEventListener(`${updateString}-isVisible`, handleVisibilityChange);
    window.addEventListener(`${updateString}-statuses`, handleStatusChange);
    return () => {
      window.removeEventListener(`${updateString}-name`, handleNameChange);
      window.removeEventListener(`${updateString}-avatarUri`, handleImageChange);
      window.removeEventListener(`${updateString}-health`, handleHealthChange);
      window.removeEventListener(`${updateString}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`${updateString}-deathSaves`, handleDeathSavesChange);
      window.removeEventListener(`${updateString}-lifeSaves`, handleLifeSavesChange);
      window.removeEventListener(`${updateString}-size`, handleSizeChange);
      window.removeEventListener(`${updateString}-isVisible`, handleVisibilityChange);
      window.removeEventListener(`${updateString}-statuses`, handleStatusChange);
    };
  }, []);

  const healthnamePlate = (
    <HealthNamePlate
      name={name}
      health={health}
      totalHealth={totalHealth}
      HealthChange={(val: number): void => {
        switch (itemType) {
          case "player":
            break;
          case "enemy":
            authContext.room.send("EnemyHealth", {
              id: `${id}`,
              health: val,
              total_health: totalHealth,
            })
            break;
          case "summons":
            authContext.room.send("SummonHealth", {
              id: +id,
              health: val,
              total_health: totalHealth,
            })
            break;
        }
      }}
      TotalHealthChange={(val: number): void => {
        switch (itemType) {
          case "player":
            break;
          case "enemy":
            authContext.room.send("EnemyHealth", {
              id: `${id}`,
              health: health,
              total_health: val,
            })
            break;
          case "summons":
            authContext.room.send("SummonHealth", {
              id: +id,
              health: health,
              total_health: val,
            })
            break;
        }
      }}
    />
  );

  const deathElement = (
    <DeathComponent
      deathNumber={deathSaves}
      saveNumber={lifeSaves}
      id={id}
      deathAdd={
        () => {
          switch (itemType) {
            case "player":
              break;
            case "enemy":
              authContext.room.send("enemyDeathAdd", { clientToChange: `${id}` });
              break;
            case "summons":
              authContext.room.send("summonDeathAdd", { id: +id });
              break;
          }
        }}
      deathRemove={() => {
        switch (itemType) {
          case "player":
            break;
          case "enemy":
            authContext.room.send("enemyDeathRemove", { clientToChange: `${id}` });
            break;
          case "summons":
            authContext.room.send("summonDeathRemove", { id: +id });
            break;
        }
      }}
      saveAdd={() => {
        switch (itemType) {
          case "player":
            break;
          case "enemy":
            authContext.room.send("enemySaveAdd", { clientToChange: `${id}` });
            break;
          case "summons":
            authContext.room.send("summonSaveAdd", { id: +id });
            break;
        }
      }}
      saveRemove={() => {
        switch (itemType) {
          case "player":
            break;
          case "enemy":
            authContext.room.send("enemySaveRemove", { clientToChange: `${id}` });
            break;
          case "summons":
            authContext.room.send("summonSaveRemove", { id: +id });
            break;
        }
      }}
    />
  );

  const healDamageElement = (
    <HealDamageComponent
      HealthClick={(val: number) => {
        switch (itemType) {
          case "player":
            break;
          case "enemy":
            authContext.room.send("enemyHeal", { clientToChange: `${id}`, heal: val });
            break;
          case "summons":
            authContext.room.send("summonHeal", { id: +id, heal: val });
            break;
        }
      }}
      DamageClick={(val: number) => {
        switch (itemType) {
          case "player":
            break;
          case "enemy":
            authContext.room.send("enemyDamage", { clientToChange: `${id}`, damage: val });
            break;
          case "summons":
            authContext.room.send("summonDamage", { id: +id, damage: val });
            break;
        }
      }}
    />
  );

  const handleEditCallback = () => {
    //show modal
    setShowEditCharacter(true);
    // Send the data
  };

  const handleStatusClick = () => {
    setShowStatusModal(true);
  }

  const handleDuplicateCallback = () => {
    switch (itemType) {
      case "player":
        break;
      case "enemy":
        authContext.room.send("addEnemy", {
          avatarUri: avatarUri,
          name: name,
          position: new mLatLng(0, 0),
          size: size_category,
        });
        break;
      case "summons":
        authContext.room.send("addSummons", {
          avatarUri: avatarUri,
          name: name,
          position: new mLatLng(0, 0),
          size: size_category,
        });
        break;
    }
  };
  const handleDeleteCallback = () => {
    switch (itemType) {
      case "player":
        break;
      case "enemy":
        authContext.room.send("deleteEnemy", { id: `${id}` });
        break;
      case "summons":
        authContext.room.send("deleteSummons", { id: +id });
        break;
    }
  };
  const handleVisibilityToggle = (): void => {
    switch (itemType) {
      case "player":
        break;
      case "enemy":
        authContext.room.send("toggleEnemyVisibility", { clientToChange: `${id}` })
        break;
      case "summons":
        authContext.room.send("toggleSummonVisibility", { id: +id, player_id: `${(item as Summons).player_id}` })
        break;
    }
  }

  const handleStatusRequest = (result: string[]): void => {
    switch (itemType) {
      case "player":
        break;
      case "enemy":
        authContext.room.send("setEnemyStatuses", { statuses: result, clientToChange: `${id}` });
        break;
      case "summons":
        authContext.room.send("setSummonsStatuses", { statuses: result, id: +id });
        break;
    }
  }

  return (
    <>

      <div className="w-100 h-auto">
        <div className="w-100" style={{ height: "5px" }}>
          <ProgressDiv current={health} max={totalHealth} />
        </div>
        <div className="row g-0">
          {/* Image */}
          <div
            className="d-flex justify-content-center align-items-center h-auto col-2"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowEditCharacter(true);
            }}
          >
            <img className="img-fluid" src={`${itemType === "player" ? "" : `/colyseus/getImage/`}${avatarUri}`} />
          </div>

          {/* content */}
          <div className="col-6 d-flex flex-column">
            <div className="w-100 flex-grow-1">
              {health > 0 ? healthnamePlate : deathElement}
            </div>
            <div className="w-100 h-fit mb-1 d-flex">
              {/* Remove */}
              <button className="mx-3 btn btn-danger w-auto h-auto p-1" style={{ maxHeight: "fit-content" }} onClick={() => handleDeleteCallback()}>
                <i className="bi bi-trash"></i>
              </button>
              <div className="row w-100 gap-1 p-0 pe-1 g-0 m-0 justify-content-end">
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
                  {isVisible ? <i className="bi bi-eye-fill"></i> : <i className="bi bi-eye-slash-fill"></i>}
                </button>
                <button className="col-1 btn btn-primary w-auto h-auto p-1" onClick={() => handleStatusClick()}>
                  <i className="bi bi-magic"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-4">
            {healDamageElement}
          </div>
        </div>
      </div>
      {
        showEditCharacter ?
          <EditCharacterModal
            callback={(data) => {
              if (data === undefined) {
                console.error("Value for edit is null");
                setShowEditCharacter(false);
                return;
              }

              switch (itemType) {
                case "enemy":
                  authContext.room.send(`updateEnemy`, {
                    id: id + "",
                    name: data.name,
                    size: data.size_category,
                    avatarUri: data.avatarUri,
                  });
                  break;
                case "summons":
                  authContext.room.send(`updateSummons`, {
                    id: +id,
                    name: data.name,
                    size: data.size_category,
                    avatarUri: data.avatarUri,
                  });
                  break
                case "player":
                  break;
              }

              setShowEditCharacter(false);
              return;
            }}
            title={`${itemType} Edit`}
            name={name}
            size_category={size_category}
            avatarUri={avatarUri}
            key={`ChangeChacterStats-${id}`}
          /> : <></>
      }
      {
        showStatusModal ?
          <StatusDropdown
            onSubmit={(result: string[]): void => {
              handleStatusRequest(result);
              setShowStatusModal(false);
            }}
            onClose={() => { setShowStatusModal(false); }}
            selectedStatuses={statuses.map((ele: CharacterStatus): string => ele.status)}
          />
          : ""
      }
    </>
  );
}
