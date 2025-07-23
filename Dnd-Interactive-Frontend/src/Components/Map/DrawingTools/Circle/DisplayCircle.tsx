import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { CircleDrawing } from "../../../../../shared/src/DrawingInterface";
import { Player } from "../../../../../shared/src/Player";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import Circle from "./Circle";

/**
 * React Component that displays all lines from a player that are registered with the server.
 * If looking to draw lines look into DrawLine.tsx component.
 */
export default function DisplayCircle({ player }: { player: Player }) {
  const players = usePlayers();
  const toolContext = useGameToolContext();
  const authContext = useAuthenticatedContext();

  const [circle, setCircle] = useState<CircleDrawing | undefined>(players.getPlayer(player.userId)!.circleDrawing);
  const [color, setColor] = useState<string>(player.color);
  useEffect(() => {
    const setValue = (value: any) => {
      setCircle(value.detail.val);
    };
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    window.addEventListener(`update-${player.userId}-circleDrawing`, setValue);
    return () => {
      window.removeEventListener(`update-${player.userId}-circleDrawing`, setValue);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
    };
  }, []);

  const handleRemove = () => {
    if (authContext.user.id !== player.userId) return; // I do not want to remove any other shapes other than my own.
    switch (toolContext.curTool) {
      case Tools.DELETE:
        authContext.room.send("removeCircle");
        break;
      default:
        console.log("Nothing to handle");
    }
  };

  return circle !== undefined ? <Circle key={`CircleDraw-${player.userId}`} center={new LatLng(circle!.center.lat, circle!.center.lng)} color={color} radius={circle!.radius} removeCallback={handleRemove} /> : "";
}
