import { usePlayers } from "../../ContextProvider/PlayersContext/PlayersContext";

import { Player } from "../../../src/shared/Player"
import React from "react";
import Background from "../../Components/Background/Background";
import Loading from "../../Components/Loading";
import { useGameState } from "../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import { TAuthenticatedContext } from "../../Types/types";
import HostMM from "./HostMM";
import PlayerMM from "./PlayerMM";

/**
 * Component the represents the main menu. The user will be loading into this when the activity starts
 */
export default function MainMenu() {
  const playerContext = usePlayers();
  const authContext: TAuthenticatedContext = useAuthenticatedContext();
  const mapContext = useGameState();
  const [currentPlayer, setCurrentPlayer] = React.useState<Player | undefined>(undefined);
  const [otherPlayers, setOtherPlayers] = React.useState<Player[]>([]);
  const [currentHostId, setHostId] = React.useState<string | undefined>(mapContext.getCurrentHostId());
  const [mapLoaded, setMapLoaded] = React.useState<boolean>(mapContext.getMap() != null);

  React.useEffect(() => {
    const updateList = (value: any) => {
      splitPlayers(value.detail.val);
    };

    const handleHostId = (value: any) => {
      setHostId(value.detail.val);
    };

    const handleMapChange = (value: any) => {
      setMapLoaded(value.detail.val != null);
    };

    function splitPlayers(data: { [key: string]: Player }) {
      const me: Player = data[authContext.user.id];

      const otherPlayers: Player[] = Object.values(data).filter((val: Player) => {
        return val.userId !== authContext.user.id;
      });

      setCurrentPlayer(me);
      setOtherPlayers(otherPlayers);
    }
    splitPlayers(playerContext.getAllPlayers());

    window.addEventListener(`PlayersChanged`, updateList);
    window.addEventListener(`HostIdChange`, handleHostId);
    window.addEventListener(`MapUpdate`, handleMapChange);

    return () => {
      window.removeEventListener(`PlayersChanged`, updateList);
      window.removeEventListener(`HostIdChange`, handleHostId);
      window.removeEventListener(`MapUpdate`, handleMapChange);
    };
  }, []);

  const isHostTaken = () => {
    return currentHostId !== undefined;
  };
  const amIHost = (): boolean => {
    return isHostTaken() && currentHostId === authContext.user.id;
  };

  if (!currentPlayer) return <Loading />;
  return (
    <div className="h-100 d-flex flex-column overflow-auto">
      <Background background="Assets/background.jpg" />
      <div className="w-100 d-flex justify-content-center pt-3" style={{ height: "20%" }}>
        <img className="h-100" src="Assets/logo.png" alt="titleImage"></img>
      </div>
      <div className="container-fluid d-flex flex-column justify-content-center" style={{ flex: "1 1 auto", height: "1px" }}>
        {amIHost() ? <HostMM otherPlayers={otherPlayers} /> : <PlayerMM currentPlayer={currentPlayer} otherPlayers={otherPlayers} />}
      </div>
    </div>
  );
}
