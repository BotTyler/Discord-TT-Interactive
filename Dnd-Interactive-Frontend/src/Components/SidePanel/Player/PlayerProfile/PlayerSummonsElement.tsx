import { useEffect, useState } from "react";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext"
import { Summons } from "../../../../shared/Summons";
import { Player } from "../../../../shared/Player";
import HealthDeathTrackerElement from "../../General/HealthDeathTracker/HealthDeathTrackerElement";
import { mLatLng } from "../../../../shared/PositionInterface";
import EditCharacterModal from "../../../Modal/SummonedCharacterModal";

export default function PlayerSummonsListElement({ }: {}) {
  const authContext = useAuthenticatedContext();
  const players = usePlayers();

  const [summons, setSummons] = useState<Summons[]>([])
  const [isAddingSummon, setIsAddingSummon] = useState<boolean>(false);

  useEffect(() => {
    const currentPlayer: Player | null = players.getPlayer(authContext.user.id) ?? null;
    if (currentPlayer === null) return;

    setSummons(currentPlayer.summons);

    const handleSummonsChange = (val: any) => {
      setSummons(val.detail.val);
    }

    window.addEventListener(`update-${currentPlayer.userId}-summons`, handleSummonsChange);
    return () => {
      window.removeEventListener(`update-${currentPlayer.userId}-summons`, handleSummonsChange);
    }
  }, [authContext.room])

  return (
    <>
      <div className="w-100 h-100">
        <ul className="list-group">
          {summons.map((summon: Summons) => {
            return <PlayerSummonsElement key={`Player-Summon-Element-${summon.id}-Tracker`} summon={summon} />
          })}
        </ul>
        <button
          className="btn btn-primary p-1 m-0 g-0 w-100"
          onClick={() => {
            setIsAddingSummon(true);
          }}
        >
          Add Summon
        </button>
      </div>
      {isAddingSummon ? (
        <EditCharacterModal
          callback={(data) => {
            if (data !== undefined) {
              authContext.room.send("addSummons", {
                avatarUri: data.avatarUri,
                name: data.name,
                position: new mLatLng(0, 0),
                size: data.size,
                totalHealth: data.hp,
              });
            }
            setIsAddingSummon(false);
            return;
          }}
          title="Summon Add"
          avatarUri={""}
          name=""
          totalHp={1}
          key={`AddSummonModal`}
        />
      ) : (
        ""
      )}
    </>
  )
}

function PlayerSummonsElement({ summon }: { summon: Summons }) {

  return (
    <li className="list-group-item" key={`Summon-Element-${summon.id}`} >
      <HealthDeathTrackerElement item={summon} itemType="summons" />
    </li>
  )
}

