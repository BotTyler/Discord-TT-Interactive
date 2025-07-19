import { Player } from "dnd-interactive-shared";
import * as React from "react";

import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { PlayersListHandler } from "./PlayersListHandler";

export interface PlayersContextInterface {
  getPlayer: (id: string) => Player | undefined;
  getAllPlayers: () => { [key: string]: Player };
}

const PlayersContext = React.createContext<PlayersContextInterface>({
  getPlayer: (id: string) => {
    return undefined;
  },
  getAllPlayers: () => {
    return {};
  },
});

export function PlayersContextProvider({ children }: { children: React.ReactNode }) {
  const playerListRef = React.useRef<any>(null);
  const [refReady, setReady] = React.useState<boolean>(false);
  const authContext = useAuthenticatedContext();

  const getPlayer = (id: string): Player | undefined => {
    if (playerListRef.current == null) return undefined;
    return playerListRef.current.getPlayer(id);
  };

  const getAllPlayers = () => {
    if (playerListRef.current == null) return {};
    return playerListRef.current.getPlayers();
  };

  React.useEffect(() => {
    const start = () => {
      // I need to make sure that I am listed as a player
      if (!getPlayer(authContext.user.id)) return;
      setReady(true);
    };
    if (refReady) return; // if this is true I no longer need the event listener
    window.addEventListener("PlayersChanged", start);
    return () => {
      window.removeEventListener("PlayersChanged", start);
    };
  }, [refReady]);

  const getChildComponent = () => {
    if (refReady) {
      return children;
    }

    return <p>Players Loading</p>;
  };
  return (
    <PlayersContext.Provider
      value={{
        getPlayer: getPlayer,
        getAllPlayers: getAllPlayers,
      }}
    >
      <PlayersListHandler ref={playerListRef} />
      {getChildComponent()}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  return React.useContext(PlayersContext);
}
