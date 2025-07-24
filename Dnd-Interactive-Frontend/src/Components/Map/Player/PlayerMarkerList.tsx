import { Player } from "../../../../src/shared/Player";
import React from "react";
import { usePlayers } from "../../../ContextProvider/PlayersContext/PlayersContext";
import DisplayArc from "../DrawingTools/Arc/DisplayArc";
import DisplayCircle from "../DrawingTools/Circle/DisplayCircle";
import DisplayCube from "../DrawingTools/Cube/DisplayCube";
import DisplayLines from "../DrawingTools/Lines/DisplayLines";
import PlayerController from "./PlayerController";

export default function PlayerMarkerList() {
  const playerContext = usePlayers();
  const [playerList, setList] = React.useState<{ [key: string]: Player }>(playerContext.getAllPlayers());

  React.useEffect(() => {
    const updateList = (value: any) => {
      setList(value.detail.val);
    };

    window.addEventListener("PlayersChanged", updateList);

    return () => {
      window.removeEventListener("PlayersChanged", updateList);
    };
  }, []);

  return (
    <>
      {Object.values(playerList).map((player, index) => {
        return (
          <div key={`PlayerElements-${player.userId}`}>
            <DisplayLines player={player} />
            <DisplayCube player={player} />
            <DisplayCircle player={player} />
            <DisplayArc player={player} />
            <PlayerController player={player} />
          </div>
        );
      })}
    </>
  );
}
