import { useEffect, useState } from "react";
import Cube from "./Cube";
import { LatLng, LeafletMouseEvent } from "leaflet";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { DrawingTools, useDrawingGameToolContext } from "../../../../ContextProvider/GameDrawingProvider";
import { useMap, useMapEvents } from "react-leaflet";
import DistanceLine from "../../Player/DistanceLine";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";

export default function DrawCube() {
  const authContext = useAuthenticatedContext();
  const mapContext = useGameState();
  const drawingToolContext = useDrawingGameToolContext();
  const map = useMap();

  const [cubeCenter, setCubeCenter] = useState<LatLng | undefined>(undefined);
  const [cubeRadius, setCubeRadius] = useState<number | undefined>(undefined);
  const [playerSize, setPlayerSize] = useState<number>(mapContext.getIconHeight());

  const drawingReady = (): boolean => {
    return cubeCenter !== undefined && cubeRadius !== undefined;
  };
  useEffect(() => {
    const startCube = () => {
      setCubeCenter(undefined);
      setCubeRadius(undefined);
    };
    const cancelCube = () => {
      setCubeCenter(undefined);
      setCubeRadius(undefined);
    };

    drawingToolContext.registerStartHandlers(DrawingTools.CUBE, startCube);
    drawingToolContext.registerCancelHandlers(DrawingTools.CUBE, cancelCube);
  }, [cubeCenter, cubeRadius]);

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
      if (drawingToolContext.curTool !== DrawingTools.CUBE) return;
      if (e.originalEvent.button !== 2) return;
      setCubeCenter(e.latlng);
      setCubeRadius(0);
    },
    mousemove: (e: LeafletMouseEvent) => {
      if (cubeCenter === undefined) return;
      const moveTo = e.latlng;
      setCubeRadius(map.distance(cubeCenter, moveTo));
    },
    mouseup: (e: LeafletMouseEvent) => {
      if (drawingToolContext.curTool !== DrawingTools.CUBE) return;
      if (e.originalEvent.button !== 2) return;
      authContext.room.send("addCube", { center: cubeCenter, radius: cubeRadius });

      setCubeCenter(undefined);
      setCubeRadius(undefined);
    },
  });

  return drawingReady() ? (
    <>
      <Cube center={cubeCenter!} radius={cubeRadius!} color="#fff" key={`CurrentCube`} removeCallback={() => {}} />
      <DistanceLine start={new LatLng(cubeCenter!.lat, cubeCenter!.lng - cubeRadius!)} end={new LatLng(cubeCenter!.lat, cubeCenter!.lng + cubeRadius!)} size={playerSize} color={"red"} key={`CurrentCubeCreationDistanceLine`} />
    </>
  ) : (
    ""
  );
}
