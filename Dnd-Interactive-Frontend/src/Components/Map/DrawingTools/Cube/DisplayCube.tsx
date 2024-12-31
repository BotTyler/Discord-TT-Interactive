import L, { LatLng, latLng } from "leaflet";
import { useEffect, useState } from "react";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { CubeDrawing, Player } from "dnd-interactive-shared";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { mLatLng } from "dnd-interactive-shared";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import Cube from "./Cube";

/**
 * React Component that displays all lines from a player that are registered with the server.
 * If looking to draw lines look into DrawLine.tsx component.
 */
export default function DisplayCube({ player }: { player: Player }) {
  const players = usePlayers();
  const toolContext = useGameToolContext();
  const authContext = useAuthenticatedContext();

  const [cube, setCube] = useState<CubeDrawing | undefined>(players.getPlayer(player.userId)!.cubeDrawing);
  const [color, setColor] = useState<string>(player.color);
  useEffect(() => {
    const setValue = (value: any) => {
      setCube(value.detail.val);
    };
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    window.addEventListener(`update-${player.userId}-cubeDrawing`, setValue);
    return () => {
      window.removeEventListener(`update-${player.userId}-cubeDrawing`, setValue);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
    };
  }, []);

  const handleRemove = () => {
    if (authContext.user.id !== player.userId) return; // I do not want to remove any other shapes other than my own.
    switch (toolContext.curTool) {
      case Tools.DELETE:
        authContext.room.send("removeCube");
        break;
      default:
        console.log("Nothing to handle");
    }
  };

  return cube !== undefined ? <Cube key={`CubeDraw-${player.userId}`} center={new LatLng(cube.center.lat, cube.center.lng)} color={color} radius={cube!.radius} removeCallback={handleRemove} /> : "";
}
