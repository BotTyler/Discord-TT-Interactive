import { LatLng, LeafletMouseEvent } from "leaflet";
import { useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { DrawingTools, useDrawingGameToolContext } from "../../../../ContextProvider/GameDrawingProvider";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import Beam from "./Beam";
import DistanceLine from "../../PlayableMarkers/DistanceLine";

export default function DrawBeam() {
  const authContext = useAuthenticatedContext();
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
    const startBeam = () => {
      setStart(null);
      setEnd(null);
    };
    const cancelBeam = () => {
      setStart(null);
      setEnd(null);
    };
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    drawingToolContext.registerStartHandlers(DrawingTools.BEAM, startBeam);
    drawingToolContext.registerCancelHandlers(DrawingTools.BEAM, cancelBeam);
    return () => {
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
    };
  }, []);

  useMapEvents({
    mousedown: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.BEAM) return;
      if (e.originalEvent.button !== 2) return;
      setStart(e.latlng);
      setEnd(e.latlng);
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (start === null) return;
      setEnd(e.latlng);
    },
    mouseup: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.BEAM) return;
      if (e.originalEvent.button !== 2) return;
      authContext.room.send("addBeam", { start: start, end: end, width: 5 });

      setStart(null);
      setEnd(null);
    },
  });

  return drawingReady() ? (
    <>
      <Beam start={start!} end={end!} width={5} playerSize={playerSize} color="#fff" key={`CurrentBeam`} removeCallback={() => { }} />
      <DistanceLine start={start!} end={end!} size={playerSize} color={"red"} key={`CurrentCircleCreationDistanceLine`} />
    </>
  ) : (
    ""
  );
}
