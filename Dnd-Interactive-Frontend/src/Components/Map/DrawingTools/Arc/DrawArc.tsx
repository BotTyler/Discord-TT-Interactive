import { LatLng, LeafletMouseEvent } from "leaflet";
import { useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { DrawingTools, useDrawingGameToolContext } from "../../../../ContextProvider/GameDrawingProvider";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import DistanceLine from "../../PlayableMarkers/DistanceLine";
import Arc from "./Arc";


export default function DrawArc() {
  const authContext = useAuthenticatedContext();
  const mapContext = useGameState();
  const drawingToolContext = useDrawingGameToolContext();

  const [arcCenter, setArcCenter] = useState<LatLng | undefined>(undefined);
  const [toLocation, setTo] = useState<LatLng | undefined>(undefined);
  const [playerSize, setPlayerSize] = useState<number>(mapContext.getIconHeight());

  const drawingReady = (): boolean => {
    return arcCenter !== undefined && toLocation !== undefined;
  };

  useEffect(() => {
    const startArc = () => {
      setArcCenter(undefined);
      setTo(undefined);
    };
    const cancelArc = () => {
      setArcCenter(undefined);
      setTo(undefined);
    };

    drawingToolContext.registerStartHandlers(DrawingTools.ARC, startArc);
    drawingToolContext.registerCancelHandlers(DrawingTools.ARC, cancelArc);
  }, [arcCenter, toLocation]);

  useEffect(() => {
    const handleIconHeightChange = (val: any) => {
      setPlayerSize(val.detail.val);
    };
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    return () => {
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
    };
  }, []);

  useMapEvents({
    mousedown: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.ARC) return;
      if (e.originalEvent.button !== 2) return;
      setArcCenter(e.latlng);
      setTo(e.latlng);
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (arcCenter === undefined) return;
      setTo(e.latlng);
    },
    mouseup: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.ARC) return;
      if (e.originalEvent.button !== 2) return;
      // we need to submit
      authContext.room.send("addArc", { center: arcCenter, toLocation: toLocation, angle: 45 }); // angle hard coded will be remove when ui updates
      setArcCenter(undefined);
      setTo(undefined);
    },
  });

  return drawingReady() ? (
    <>
      <Arc center={arcCenter!} angle={45} toLocation={toLocation!} color="#fff" key={`CurrentArc`} removeCallback={() => { }} />
      <DistanceLine start={arcCenter!} end={toLocation!} size={playerSize} color={"red"} key={`CurrentArcCreationDistanceLine`} />
    </>
  ) : (
    ""
  );
}
