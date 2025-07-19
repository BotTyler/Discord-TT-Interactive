import { GameStateEnum } from "dnd-interactive-shared";
import React from "react";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";

/**
 * Component that will handle the import and export of a map
 */
export default function ImportExport() {
  const authContext = useAuthenticatedContext();

  // const handleImport = React.useCallback((e: React.MouseEvent) => {
  //   authContext.room.send("getSaves");
  // }, []);

  const handleExport = React.useCallback((e: React.MouseEvent) => {
    authContext.room.send("exportMap");
  }, []);

  return (
    <div className="row justify-content-between p-0 g-0 my-1">
      {/* <button className="btn col-3" onClick={handleImport}>
        Import
      </button> */}
      <button
        className="btn btn-primary col-4 p-0"
        onClick={() => {
          authContext.room.send("setGameState", {
            gameState: GameStateEnum.MAINMENU,
          });
        }}
      >
        {`<Back`}
      </button>
      <button className="btn btn-primary col-4 p-0" onClick={handleExport}>
        Save
      </button>
      {/* <BootstrapSelect data={data} /> */}
    </div>
  );
}
