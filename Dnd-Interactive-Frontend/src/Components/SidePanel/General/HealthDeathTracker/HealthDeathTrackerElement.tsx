import { Player } from "../../../../../src/shared/Player";
import { Enemy } from "../../../../../src/shared/Enemy";
import { useEffect, useState } from "react";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import DeathComponent from "./DeathComponent";
import HealthComponent from "./HealthComponent";

export default function HealthDeathTrackerElement({ item, isPlayer }: { item: Player | Enemy; isPlayer: boolean }) {
  const [name, setName] = useState<string>(item.name);
  const [avatarUri, setUri] = useState<string>(item.avatarUri);
  const [health, setHealth] = useState<number>(item.health);
  const [totalHealth, setTotalHealth] = useState<number>(item.totalHealth);
  const [deathSaves, setDeathSaves] = useState<number>(item.deathSaves);
  const [lifeSaves, setLifeSaves] = useState<number>(item.lifeSaves);
  const authContext = useAuthenticatedContext();

  useEffect(() => {
    const updateString = isPlayer ? `update-${(item as Player).userId}` : `EnemyUpdate-${(item as Enemy).id}`;
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

    window.addEventListener(`${updateString}-name`, handleNameChange);
    window.addEventListener(`${updateString}-avatarUri`, handleImageChange);
    window.addEventListener(`${updateString}-health`, handleHealthChange);
    window.addEventListener(`${updateString}-totalHealth`, handleTotalHealthChange);
    window.addEventListener(`${updateString}-deathSaves`, handleDeathSavesChange);
    window.addEventListener(`${updateString}-lifeSaves`, handleLifeSavesChange);
    return () => {
      window.removeEventListener(`${updateString}-name`, handleNameChange);
      window.removeEventListener(`${updateString}-avatarUri`, handleImageChange);
      window.removeEventListener(`${updateString}-health`, handleHealthChange);
      window.removeEventListener(`${updateString}-totalHealth`, handleTotalHealthChange);
      window.removeEventListener(`${updateString}-deathSaves`, handleDeathSavesChange);
      window.removeEventListener(`${updateString}-lifeSaves`, handleLifeSavesChange);
    };
  }, []);

  return (
    <div>
      {/* Name */}
      <div className="w-100 text-center">
        <p className="m-0">{name}</p>
      </div>
      <div className="row align-items-center text-center justify-content-center">
        {/* Image */}
        <div className="col-2">
          <img className="img-fluid" src={`${isPlayer ? "" : `/colyseus/getImage/`}${avatarUri}`} />
        </div>

        {/* content */}
        <div className="col-10">
          {/* Health and Death Saving throw container */}
          <div className="w-100">
            {health > 0 ? (
              <HealthComponent
                health={health}
                totalHealth={totalHealth}
                HealthClick={(val: number) => {
                  if (isPlayer) {
                    const id = (item as Player).userId;
                    authContext.room.send("playerHeal", { clientToChange: id, heal: val });
                  } else {
                    const id = (item as Enemy).id;
                    authContext.room.send("enemyHeal", { clientToChange: `${id}`, heal: val });
                  }
                }}
                DamageClick={(val: number) => {
                  if (isPlayer) {
                    const id = (item as Player).userId;
                    authContext.room.send("playerDamage", { clientToChange: id, damage: val });
                  } else {
                    const id = (item as Enemy).id;
                    authContext.room.send("enemyDamage", { clientToChange: `${id}`, damage: val });
                  }
                }}
              />
            ) : (
              <DeathComponent
                deathNumber={deathSaves}
                saveNumber={lifeSaves}
                id={isPlayer ? `Player-${(item as Player).userId}` : `Enemy-${(item as Enemy).id}`}
                deathAdd={() => {
                  if (isPlayer) {
                    const id = (item as Player).userId;
                    authContext.room.send("playerDeathAdd", { clientToChange: id });
                  } else {
                    const id = (item as Enemy).id;
                    authContext.room.send("enemyDeathAdd", { clientToChange: `${id}` });
                  }
                }}
                deathRemove={() => {
                  if (isPlayer) {
                    const id = (item as Player).userId;
                    authContext.room.send("playerDeathRemove", { clientToChange: id });
                  } else {
                    const id = (item as Enemy).id;
                    authContext.room.send("enemyDeathRemove", { clientToChange: `${id}` });
                  }
                }}
                saveAdd={() => {
                  if (isPlayer) {
                    const id = (item as Player).userId;
                    authContext.room.send("playerSaveAdd", { clientToChange: id });
                  } else {
                    const id = (item as Enemy).id;
                    authContext.room.send("enemySaveAdd", { clientToChange: `${id}` });
                  }
                }}
                saveRemove={() => {
                  if (isPlayer) {
                    const id = (item as Player).userId;
                    authContext.room.send("playerSaveRemove", { clientToChange: id });
                  } else {
                    const id = (item as Enemy).id;
                    authContext.room.send("enemySaveRemove", { clientToChange: `${id}` });
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
