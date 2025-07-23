import { Enemy } from "../../../../../src/shared/Enemy"
import { Player } from "../../../../../src/shared/Player"
import React from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";

export default function InitiativeListHandler({ }: {}) {
  const players = usePlayers();
  const gameStateContext = useGameState();
  const authContext = useAuthenticatedContext();
  const [sortedPlayers, setSortedPlayers] = React.useState<Player[]>(Object.values(players.getAllPlayers()));
  const [sortedEnemies, setSortedEnemies] = React.useState<Enemy[]>(Object.values(gameStateContext.getEnemies()));

  const [sortedFullList, setFullList] = React.useState<React.ReactNode[]>([]);
  const [initiativeIndex, setInitiativeIndex] = React.useState<number>(gameStateContext.getInitiativeIndex());

  React.useEffect(() => {
    const fullList: React.ReactNode[] = [];
    var playersIndex = 0;
    var enemiesIndex = 0;
    while (playersIndex < sortedPlayers.length && enemiesIndex < sortedEnemies.length) {
      const curPlayer = sortedPlayers[playersIndex];
      if (curPlayer.isHost) {
        playersIndex++;
        continue;
      }
      const curEnemy = sortedEnemies[enemiesIndex];
      const isActive = fullList.length === initiativeIndex;
      if (curPlayer.initiative >= curEnemy.initiative) {
        fullList.push(
          <InitiativeListElement
            avatarUri={curPlayer.avatarUri}
            initiative={curPlayer.initiative}
            name={curPlayer.name}
            onInitiativeChange={(val: number) => {
              authContext.room.send("changeInitiative", { initiative: val, clientToChange: curPlayer.userId });
            }}
            isActive={isActive}
            key={`InitiativeListElement-Player-${curPlayer.userId}`}
          />
        );
        playersIndex++;
      } else {
        fullList.push(
          <InitiativeListElement
            avatarUri={`/colyseus/getImage/${curEnemy.avatarUri}`}
            initiative={curEnemy.initiative}
            name={curEnemy.name}
            onInitiativeChange={(val: number) => {
              authContext.room.send("changeEnemyInitiative", { initiative: val, id: curEnemy.id + "" });
            }}
            isActive={isActive}
            key={`InitiativeListElement-Enemy-${curEnemy.id}`}
          />
        );
        enemiesIndex++;
      }
    }

    // check if any are left
    while (playersIndex < sortedPlayers.length) {
      const curPlayer = sortedPlayers[playersIndex];
      const isActive = fullList.length === initiativeIndex;

      fullList.push(
        <InitiativeListElement
          avatarUri={curPlayer.avatarUri}
          initiative={curPlayer.initiative}
          name={curPlayer.name}
          onInitiativeChange={(val: number) => {
            authContext.room.send("changeInitiative", { initiative: val, clientToChange: curPlayer.userId });
          }}
          isActive={isActive}
          key={`InitiativeListElement-Player-${curPlayer.userId}`}
        />
      );
      playersIndex++;
    }

    while (enemiesIndex < sortedEnemies.length) {
      const curEnemy = sortedEnemies[enemiesIndex];
      const isActive = fullList.length === initiativeIndex;

      fullList.push(
        <InitiativeListElement
          avatarUri={`/colyseus/getImage/${curEnemy.avatarUri}`}
          initiative={curEnemy.initiative}
          name={curEnemy.name}
          onInitiativeChange={(val: number) => {
            authContext.room.send("changeEnemyInitiative", { initiative: val, id: curEnemy.id + "" });
          }}
          isActive={isActive}
          key={`InitiativeListElement-Enemy-${curEnemy.id}`}
        />
      );
      enemiesIndex++;
    }

    setFullList(fullList);
  }, [sortedPlayers, sortedEnemies, initiativeIndex]);

  React.useEffect(() => {
    sortPlayers();
    sortEnemies();
    const handlePlayersInitChange = () => {
      sortPlayers();
    };
    const EnemiesInitiativeChange = () => {
      sortEnemies();
    };

    const handleInitiativeIndexChange = (val: any) => {
      setInitiativeIndex(val.detail.val);
    };

    window.addEventListener("PlayersInitiativeChange", handlePlayersInitChange);
    window.addEventListener("EnemiesInitiativeChange", EnemiesInitiativeChange);
    window.addEventListener("InitiativeIndexChanged", handleInitiativeIndexChange);
    return () => {
      window.removeEventListener("PlayersInitiativeChange", handlePlayersInitChange);
      window.removeEventListener("EnemiesInitiativeChange", EnemiesInitiativeChange);
      window.removeEventListener("InitiativeIndexChanged", handleInitiativeIndexChange);
    };
  }, []);

  const sortPlayers = () => {
    const playersList = Object.values(players.getAllPlayers()).sort((a: Player, b: Player) => {
      return b.initiative - a.initiative;
    });
    setSortedPlayers(playersList);
  };

  const sortEnemies = () => {
    const enemyList = Object.values(gameStateContext.getEnemies()).sort((a: Enemy, b: Enemy) => {
      return b.initiative - a.initiative;
    });
    setSortedEnemies(enemyList);
  };

  return (
    <>
      {sortedFullList.map((val) => {
        return val;
      })}
    </>
  );
}

export function InitiativeListElement({ avatarUri, name, initiative, isActive, onInitiativeChange }: { avatarUri: string; name: string; initiative: number; isActive: boolean; onInitiativeChange: (val: number) => void }) {
  const [_initiative, setInitiative] = React.useState<number>(initiative);
  const [_name, setName] = React.useState<string>(name);
  const [_avatar, setAvatar] = React.useState<string>(avatarUri);
  React.useEffect(() => {
    setInitiative(initiative);
  }, [initiative]);
  React.useEffect(() => {
    setName(name);
  }, [name]);
  React.useEffect(() => {
    setAvatar(avatarUri);
  }, [avatarUri]);
  const initArray = [...Array(30).keys()];
  return (
    <li className={`list-group-item ${isActive ? "bg-primary" : ""}`}>
      <div className="row">
        <div className="col-2">
          <img className="img-fluid" style={{ maxHeight: "75px" }} src={avatarUri} />
        </div>
        <div className="col-5 d-flex justify-content-center align-items-center">
          <p className="text-break">{name}</p>
        </div>
        <div className="col-5">
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={(e) => {
              onInitiativeChange(+e.target.value);
            }}
            defaultValue={_initiative}
          >
            {initArray.map((val: number, i) => {
              const actValue = val + 1;
              return (
                <option value={actValue} key={`ListGroupElement-${_name}-${i}`}>
                  {actValue}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </li>
  );
}
