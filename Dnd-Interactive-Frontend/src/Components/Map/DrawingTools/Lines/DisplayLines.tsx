import { mLatLng } from "../../../../../src/shared/PositionInterface";
import { Player } from "../../../../../src/shared/Player";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import Line from "./Line";

/**
 * React Component that displays all lines from a player that are registered with the server.
 * If looking to draw lines look into DrawLine.tsx component.
 */
export default function DisplayLines({ player }: { player: Player }) {
  const players = usePlayers();
  const toolContext = useGameToolContext();
  const authContext = useAuthenticatedContext();

  const [lines, setLines] = useState<mLatLng[]>(players.getPlayer(player.userId)!.drawings);
  const [color, setColor] = useState<string>(player.color);
  useEffect(() => {
    const setLine = (value: any) => {
      setLines(value.detail.val);
    };
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    window.addEventListener(`update-${player.userId}-drawings`, setLine);
    return () => {
      window.removeEventListener(`update-${player.userId}-drawings`, setLine);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
    };
  }, []);

  const handleRemove = () => {
    switch (toolContext.curTool) {
      case Tools.DELETE:
        authContext.room.send("removeDrawing", { playerId: player.userId });
        break;
      default:
        console.log("Nothing to handle");
    }
  };

  return (
    <>
      {
        <Line
          key={`LineDraw-${player.userId}`}
          positions={lines.map((coord: mLatLng) => {
            return L.latLng(coord.lat, coord.lng);
          })}
          color={color}
          removeCallback={handleRemove}
        />
      }
    </>
  );
}
