import { useEffect, useRef, useState } from "react";
import Fog from "./Fog";
import { LatLng, LeafletMouseEvent } from "leaflet";
import { Tools, useGameToolContext } from "../../../ContextProvider/GameToolProvider";
import { useMapEvents } from "react-leaflet";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";
import { mLatLng } from "dnd-interactive-shared";

/**
 * This function will handle fog creation on a leaflet interactive map.
 */
export default function FogCreation() {
  const [currentFog, setCurrentFog] = useState<LatLng[] | undefined>(undefined);
  const authContext = useAuthenticatedContext();

  const toolContext = useGameToolContext();


  useEffect(() => {
    const startFog = () => {
      setCurrentFog([]);
    };

    const cancelFog = function cancelFog() {
      // the fog is complete or tool has ended send the data to the server
      setCurrentFog(undefined);
    };

    const submitFog = () => {
      setCurrentFog((prev) => {
        if (prev === undefined) return;
        authContext.room.send("addFog", { polygon: prev, isVisible: false });
        return undefined;
      });
    };
    // register the handlers with the tool context. these methods will be fired at the discretion of the toolcontext.
    toolContext.registerStartHandlers(Tools.FOG, startFog);
    toolContext.registerCancelHandlers(Tools.FOG, cancelFog);
    toolContext.registerSubmitHandlers(Tools.FOG, submitFog);
  }, []);

  useMapEvents({
    mousedown: (e: LeafletMouseEvent) => {
      if (toolContext.curTool !== Tools.FOG) return;
      if (e.originalEvent.button !== 0) return; // left mouse btn

      setCurrentFog((prev) => {
        if (prev === undefined) return [e.latlng];
        return [...prev, e.latlng];
      });
    },
  });
  return currentFog !== undefined ? (
    <Fog
      _points={currentFog.map((val) => {
        return new mLatLng(val.lat, val.lng);
      })}
      _isVisible={false}
      color="#720c0e"
      fillColor="#ef4a4d"
    />
  ) : (
    ""
  );
}
