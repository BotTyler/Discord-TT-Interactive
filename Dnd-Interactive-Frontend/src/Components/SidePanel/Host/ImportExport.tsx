import { GameStateEnum } from "../../../../src/shared/State";
import React, { useEffect } from "react";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";
import { useMessageContext } from "../../../ContextProvider/Messages/MessageContextProvider";
import { TOAST_LEVEL } from "../../../ContextProvider/Messages/Toast";

/**
 * Component that will handle the import and export of a map
 */
export default function ImportExport() {
  const authContext = useAuthenticatedContext();
  const toastContext = useMessageContext();

  // const handleImport = React.useCallback((e: React.MouseEvent) => {
  //   authContext.room.send("getSaves");
  // }, []);

  useEffect(() => {
    // Start interval
    const intervalId = setInterval(() => {
      console.log("AUTOSAVING")
      authContext.room.send("exportMap", { isAutosave: true });
    }, 20 * 60 * 1000); // 20 minute

    // Cleanup: stop interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    /**
      0 - Success
      1 - Warning - Partial save
      2 - ERROR - Complete Failure
    */
    authContext.room.onMessage("SaveStatus", (status: { level: number }): void => {
      switch (status.level) {
        case 0:
          toastContext.addToast("[Success]", "Saved!", TOAST_LEVEL.SUCCES);
          break;
        case 1:
          toastContext.addToast("[WARNING]", "Partial Data Saved!", TOAST_LEVEL.WARNING);
          break;
        case 2:
          toastContext.addToast("[ERROR]", "No Data Saved!", TOAST_LEVEL.ERROR);
          break;
        default:
          toastContext.addToast("[UNKNOWN]", "Unexpected Save Status.", TOAST_LEVEL.NONE);
          break
      }
    })
  }, [authContext.room])

  const handleExport = React.useCallback((e: React.MouseEvent) => {
    authContext.room.send("exportMap", { isAutosave: false });
    toastContext.addToast("[PENDING]", "SAVING....", TOAST_LEVEL.NONE);
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
