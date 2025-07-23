import { MapFogPolygon } from "../../../../shared/src/Map";
import { useEffect, useState } from "react";
import { useGameState } from "../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";
import Fog from "./Fog";

/**
 * This React component is used to show all fogs that are registered with the server.
 * To create fog look into the FogCreation Component.
 */
export default function ShowFog() {
  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
  const [fog, setFog] = useState<{ [key: string]: MapFogPolygon }>(mapContext.getFogs());

  useEffect(() => {
    const fogChangedHandler = (value: any) => {
      setFog(value.detail.val);
    };
    window.addEventListener(`FogsChanged`, fogChangedHandler);

    return () => {
      window.removeEventListener(`FogsChanged`, fogChangedHandler);
    };
  }, []);

  const handleFogRemove = (id: string) => {
    authContext.room.send("removeFog", { id: id }); // send the remove fog signal
  };

  const handleVisibilityChange = (id: string, val: boolean) => {
    authContext.room.send("setFogVisible", { id: id, isVisible: val });
  };

  return (
    <>
      {Object.keys(fog).map((key) => {
        return <Fog _points={fog[key].points} _isVisible={fog[key].isVisible} id={key} removeCallback={handleFogRemove} visibilityCallback={handleVisibilityChange} key={`ShowFog-${key}`} color="#000000" fillColor="#282828" />;
      })}
    </>
  );
}
