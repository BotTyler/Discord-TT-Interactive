import { LatLng, LeafletMouseEvent } from "leaflet";
import { useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { DrawingTools, useDrawingGameToolContext } from "../../../../ContextProvider/GameDrawingProvider";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import Ruler from "./Ruler";

export default function DrawRuler() {
  const mapContext = useGameState();
  const drawingToolContext = useDrawingGameToolContext();

  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [playerSize, setPlayerSize] = useState<number>(mapContext.getIconHeight());

  const drawingReady = (): boolean => {
    return start !== null && end !== null;
  };

  useEffect(() => {
    const handleIconHeightChange = (val: any) => {
      setPlayerSize(val.detail.val);
    };
    const startRuler = () => {
      setStart(null);
      setEnd(null);
    };
    const cancelRuler = () => {
      setStart(null);
      setEnd(null);
    };
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    drawingToolContext.registerStartHandlers(DrawingTools.RULER, startRuler);
    drawingToolContext.registerCancelHandlers(DrawingTools.RULER, cancelRuler);
    return () => {
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
    };
  }, []);

  useMapEvents({
    mousedown: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.RULER) return;
      if (e.originalEvent.button !== 2) return;
      setStart(e.latlng);
      setEnd(e.latlng);
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (start === null) return;
      setEnd(e.latlng);
    },
    mouseup: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.RULER) return;
      if (e.originalEvent.button !== 2) return;

      setStart(null);
      setEnd(null);
    },
  });

  return drawingReady() ? (
    <>
      <Ruler
        start={start!}
        end={end!}
        playerSize={playerSize}
        color="#fff"
        key={`CurrentRuler`}
      />
    </>
  ) : (
    ""
  );
}
