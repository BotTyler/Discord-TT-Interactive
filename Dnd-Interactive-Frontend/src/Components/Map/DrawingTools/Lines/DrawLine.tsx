import { Player } from "../../../../../src/shared/Player";
import { LatLng, LeafletMouseEvent } from "leaflet";
import { useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { DrawingTools, useDrawingGameToolContext } from "../../../../ContextProvider/GameDrawingProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import Line from "./Line";

/**
 * This component will handle the drawing of lines and syncronization with the colyseus server.
 * This component should be instantiated once within a interactive react-leaflet map.
 */
export default function DrawLine({ player }: { player: Player }) {
  const authContext = useAuthenticatedContext();
  const drawingToolContext = useDrawingGameToolContext();

  const [current, setCurrentLine] = useState<LatLng[] | undefined>(undefined);
  const [color, setColor] = useState<string>(player.color);
  useEffect(() => {
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    return () => {
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
    };
  }, []);

  useMapEvents({
    mousedown: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.FREE) return;

      if (e.originalEvent.button !== 2) return;
      setCurrentLine((prev) => {
        return [e.latlng];
      });
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (current === undefined) return;
      setCurrentLine((prev) => {
        return [...prev!, e.latlng];
      });
    },
    mouseup: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.FREE) return;

      if (current === undefined) return;
      setCurrentLine((prev) => {
        const insert = [...prev!, e.latlng];

        authContext.room.send("addDrawings", { points: insert });
        return undefined;
      });
    },
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
    },
  });

  return (
    <>
      <Line key={"CurrentLine"} positions={current ?? []} color={color} removeCallback={() => { }} />
    </>
  );
}
