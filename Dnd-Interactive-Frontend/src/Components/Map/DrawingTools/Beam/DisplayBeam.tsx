import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { BeamDrawing } from "../../../../../src/shared/DrawingInterface";
import { Player } from "../../../../../src/shared/Player";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import Beam from "./Beam";

export default function DisplayBeam({ player }: { player: Player }) {
  const players = usePlayers();
  const toolContext = useGameToolContext();
  const authContext = useAuthenticatedContext();
  const mapContext = useGameState();

  const [beam, setBeam] = useState<BeamDrawing | null>(players.getPlayer(player.userId)!.beamDrawing);
  const [playerSize, setPlayerSize] = useState<number>(mapContext.getIconHeight());
  const [color, setColor] = useState<string>(player.color);

  useEffect(() => {
    const setValue = (value: any) => {
      setBeam(value.detail.val);
    };
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };
    const handleIconHeightChange = (val: any) => {
      setPlayerSize(val.detail.val);
    };
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    window.addEventListener(`update-${player.userId}-beamDrawing`, setValue);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    return () => {
      window.removeEventListener(`update-${player.userId}-beamDrawing`, setValue);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
    };
  }, []);

  const handleRemove = () => {
    switch (toolContext.curTool) {
      case Tools.DELETE:
        authContext.room.send("removeBeam", { playerId: player.userId });
        break;
      default:
        console.log("Nothing to handle");
    }
  };

  return beam != null ? (<Beam key={`BeamDrawing-${player.userId}`}
    start={new LatLng(beam.start.lat, beam.start.lng)}
    end={new LatLng(beam.end.lat, beam.end.lng)}
    width={beam.width}
    playerSize={playerSize}
    color={color} removeCallback={handleRemove} />) : "";
}
