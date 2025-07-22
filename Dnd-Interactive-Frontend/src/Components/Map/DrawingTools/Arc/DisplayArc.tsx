//import { ArcDrawing, Player } from "dnd-interactive-shared";
import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import Arc from "./Arc";

/**
 * React Component that displays all lines from a player that are registered with the server.
 * If looking to draw lines look into DrawLine.tsx component.
 */
export default function DisplayArc({ player }: { player: Player }) {
  const players = usePlayers();
  const toolContext = useGameToolContext();
  const authContext = useAuthenticatedContext();

  const [arc, setArc] = useState<ArcDrawing | undefined>(players.getPlayer(player.userId)!.arcDrawing);
  const [color, setColor] = useState<string>(player.color);
  useEffect(() => {
    const setValue = (value: any) => {
      setArc(value.detail.val);
    };
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    window.addEventListener(`update-${player.userId}-arcDrawing`, setValue);
    return () => {
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
      window.removeEventListener(`update-${player.userId}-arcDrawing`, setValue);
    };
  }, []);

  const handleRemove = () => {
    if (authContext.user.id !== player.userId) return; // I do not want to remove any other shapes other than my own.
    switch (toolContext.curTool) {
      case Tools.DELETE:
        authContext.room.send("removeArc");
        break;
      default:
        console.log("Nothing to handle");
    }
  };

  return arc !== undefined ? <Arc key={`ArcDraw-${player.userId}`} center={new LatLng(arc.center.lat, arc.center.lng)} toLocation={new LatLng(arc.toLocation.lat, arc.toLocation.lng)} angle={arc.angle} color={color} removeCallback={handleRemove} /> : "";
}
