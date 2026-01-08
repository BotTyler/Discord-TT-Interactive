import { Player } from "../../../../../src/shared/Player";
import { Enemy } from "../../../../../src/shared/Enemy";
import { useEffect, useState } from "react";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import DeathComponent from "./DeathComponent";
import HealthComponent from "./HealthComponent";
import { ProgressDiv } from "../../../ProgressBar/ProgressBarComponent";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { Summons } from "../../../../shared/Summons";
import EditCharacterModal from "../../../Modal/SummonedCharacterModal";

export default function HealthDeathTrackerElement({ item, itemType }:
  {
    item: Player | Enemy | Summons;
    itemType: "player" | "enemy" | "summons";
  }) {
  const authContext = useAuthenticatedContext();
  const gamestate = useGameState();

  const [id, setId] = useState<any>((item as Player).userId ?? (item as Enemy | Summons).id);
  const [name, setName] = useState<string>(item.name);
  const [size, setSize] = useState<number>((item as Enemy).size ?? gamestate.getIconHeight());
  const [avatarUri, setUri] = useState<string>(item.avatarUri);
  const [health, setHealth] = useState<number>(item.health);
  const [totalHealth, setTotalHealth] = useState<number>(item.totalHealth);
  const [deathSaves, setDeathSaves] = useState<number>(item.deathSaves);
  const [lifeSaves, setLifeSaves] = useState<number>(item.lifeSaves);

  const [showEditCharacter, setShowEditCharacter] = useState<boolean>(false);

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
      setSize(val.detail.val);
    }

    window.addEventListener(`${updateString}-name`, handleNameChange);
    window.addEventListener(`${updateString}-avatarUri`, handleImageChange);
    window.addEventListener(`${updateString}-health`, handleHealthChange);
    window.addEventListener(`${updateString}-totalHealth`, handleTotalHealthChange);
    window.addEventListener(`${updateString}-deathSaves`, handleDeathSavesChange);
    window.addEventListener(`${updateString}-lifeSaves`, handleLifeSavesChange);
    window.addEventListener(`${updateString}-size`, handleSizeChange);
    return () => {
      window.removeEventListener(`${updateString}-name`, handleNameChange);
      window.removeEventListener(`${updateString}-avatarUri`, handleImageChange);
      window.removeEventListener(`${updateString}-health`, handleHealthChange);
      window.removeEventListener(`${updateString}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`${updateString}-deathSaves`, handleDeathSavesChange);
      window.removeEventListener(`${updateString}-lifeSaves`, handleLifeSavesChange);
      window.removeEventListener(`${updateString}-size`, handleSizeChange);
    };
  }, []);

  return (
    <>

      <div className="">
        <div className="w-100" style={{ height: "5px" }}>
          <ProgressDiv current={health} max={totalHealth} />
        </div>
        <div className="d-flex">
          {/* Image */}
          <div
            className="d-flex justify-content-center align-items-center h-auto"
            style={{ minWidth: "50px", maxWidth: "80px", cursor: "pointer" }}
            onClick={() => {
              setShowEditCharacter(true);
            }}
          >
            <img className="img-fluid" src={`${itemType === "player" ? "" : `/colyseus/getImage/`}${avatarUri}`} />
          </div>

          {/* content */}
          <div className="flex-grow-1">
            {health > 0 ? (
              <HealthComponent
                name={name}
                health={health}
                totalHealth={totalHealth}
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
                HealthChange={(val: number): void => {
                  switch (itemType) {
                    case "player":
                      break;
                    case "enemy":
                      authContext.room.send("updateEnemy", {
                        id: `${id}`,
                        name: name,
                        size: size,
                        avatarUri: avatarUri,
                        health: val,
                        totalHealth: totalHealth,
                      })
                      break;
                    case "summons":
                      authContext.room.send("updateSummons", {
                        id: +id,
                        name: name,
                        size: size,
                        avatarUri: avatarUri,
                        health: val,
                        totalHealth: totalHealth,
                      })
                      break;
                  }
                }}
                TotalHealthChange={(val: number): void => {
                  switch (itemType) {
                    case "player":
                      break;
                    case "enemy":
                      authContext.room.send("updateEnemy", {
                        id: `${id}`,
                        name: name,
                        size: size,
                        avatarUri: avatarUri,
                        health: health,
                        totalHealth: val,
                      })
                      break;
                    case "summons":
                      authContext.room.send("updateSummons", {
                        id: +id,
                        name: name,
                        size: size,
                        avatarUri: avatarUri,
                        health: health,
                        totalHealth: val,
                      })
                      break;
                  }
                }}
              />
            ) : (
              <DeathComponent
                deathNumber={deathSaves}
                saveNumber={lifeSaves}
                id={id}
                deathAdd={() => {
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
            )}
          </div>
        </div>
      </div>
      {
        showEditCharacter ?
          <EditCharacterModal
            callback={(data) => {
              if (data === undefined) {
                setShowEditCharacter(false);
                return;
              }

              switch (itemType) {
                case "enemy":
                  authContext.room.send(`updateEnemy`, {
                    id: id + "",
                    name: data.name,
                    size: data.size,
                    avatarUri: data.avatarUri,
                    health: health,
                    totalHealth: data.hp,
                  });
                  break;
                case "summons":
                  authContext.room.send(`updateSummons`, {
                    id: id + "",
                    name: data.name,
                    size: data.size,
                    avatarUri: data.avatarUri,
                    health: health,
                    totalHealth: data.hp,
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
            size={size}
            avatarUri={avatarUri}
            totalHp={totalHealth}
            key={`ChangeChacterStats-${id}`}
          /> : <></>
      }
    </>
  );
}
