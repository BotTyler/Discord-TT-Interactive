import React from "react";
import { Enemy } from "../../../../../src/shared/Enemy";
import { Player } from "../../../../../src/shared/Player";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";

export default function PlayerInitiativeTrackerPanel({ }: {}) {
  const players = usePlayers();
  const gameStateContext = useGameState();
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
            isActive={isActive}
            isVisible={true}
            isPhotoLeft={true}
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
            isActive={isActive}
            isVisible={curEnemy.isVisible}
            isPhotoLeft={false}
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
          isActive={isActive}
          isVisible={true}
          isPhotoLeft={true}
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
          isActive={isActive}
          isVisible={curEnemy.isVisible}
          isPhotoLeft={false}
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
    const EnemiesVisibilityChange = (): void => {
      sortEnemies();
    }

    const handleInitiativeIndexChange = (val: any) => {
      setInitiativeIndex(val.detail.val);
    };

    window.addEventListener("PlayersInitiativeChange", handlePlayersInitChange);
    window.addEventListener("EnemiesInitiativeChange", EnemiesInitiativeChange);
    window.addEventListener("EnemiesVisibilityChange", EnemiesVisibilityChange);
    window.addEventListener("InitiativeIndexChanged", handleInitiativeIndexChange);
    return () => {
      window.removeEventListener("PlayersInitiativeChange", handlePlayersInitChange);
      window.removeEventListener("EnemiesInitiativeChange", EnemiesInitiativeChange);
      window.removeEventListener("EnemiesVisibilityChange", EnemiesVisibilityChange);
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
    <ul className="list-group overflow-auto p-0">
      {sortedFullList.map((val) => {
        return val;
      })}
    </ul>
  );
}

export function InitiativeListElement({ avatarUri, name, initiative, isActive, isVisible, isPhotoLeft = true }: { avatarUri: string; name: string; initiative: number; isActive: boolean; isVisible: boolean; isPhotoLeft: boolean }) {
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

  return (
    <li className={`list-group-item ${isActive ? "bg-primary" : ""} ${isVisible ? "" : "d-none"}`}>
      <div className="w-100 h-auto d-flex">
        {isPhotoLeft ?
          <div className="h-auto" style={{ width: "50px" }}>
            <img className="img-fluid" src={_avatar} />
          </div> : <></>
        }
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <p className="text-break">{_name}</p>
        </div>
        {!isPhotoLeft ?
          <div className="h-auto" style={{ width: "50px" }}>
            <img className="img-fluid" src={_avatar} />
          </div> : <></>
        }
      </div>
    </li>
  );
}
