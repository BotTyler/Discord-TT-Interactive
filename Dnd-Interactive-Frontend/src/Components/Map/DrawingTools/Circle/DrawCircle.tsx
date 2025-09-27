import { LatLng, LeafletMouseEvent } from "leaflet";
import { useEffect, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { DrawingTools, useDrawingGameToolContext } from "../../../../ContextProvider/GameDrawingProvider";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import DistanceLine from "../../PlayableMarkers/DistanceLine";
import Circle from "./Circle";

export default function DrawCircle() {
  const authContext = useAuthenticatedContext();
  const mapContext = useGameState();
  const drawingToolContext = useDrawingGameToolContext();
  const map = useMap();

  const [circleCenter, setCircleCenter] = useState<LatLng | undefined>(undefined);
  const [circleRadius, setCircleRadius] = useState<number | undefined>(undefined);
  const [playerSize, setPlayerSize] = useState<number>(mapContext.getIconHeight());

  const drawingReady = (): boolean => {
    return circleCenter !== undefined && circleRadius !== undefined;
  };

  useEffect(() => {
    const startCircle = () => {
      setCircleCenter(undefined);
      setCircleRadius(undefined);
    };
    const cancelCircle = () => {
      setCircleCenter(undefined);
      setCircleRadius(undefined);
    };

    drawingToolContext.registerStartHandlers(DrawingTools.CIRCLE, startCircle);
    drawingToolContext.registerCancelHandlers(DrawingTools.CIRCLE, cancelCircle);
  }, [circleCenter, circleRadius]);

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
      if (drawingToolContext.curTool !== DrawingTools.CIRCLE) return;
      if (e.originalEvent.button !== 2) return;
      setCircleCenter(e.latlng);
      setCircleRadius(0);
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (circleCenter === undefined) return;
      const moveTo = e.latlng;
      setCircleRadius(map.distance(circleCenter, moveTo));
    },
    mouseup: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.CIRCLE) return;
      if (e.originalEvent.button !== 2) return;
      authContext.room.send("addCircle", { center: circleCenter, radius: circleRadius });

      setCircleCenter(undefined);
      setCircleRadius(undefined);
    },
  });

  return drawingReady() ? (
    <>
      <Circle center={circleCenter!} radius={circleRadius!} color="#fff" key={`CurrentCircle`} removeCallback={() => { }} />
      <DistanceLine start={circleCenter!} end={new LatLng(circleCenter!.lat, circleCenter!.lng + circleRadius!)} size={playerSize} color={"red"} key={`CurrentCircleCreationDistanceLine`} />
    </>
  ) : (
    ""
  );
}
