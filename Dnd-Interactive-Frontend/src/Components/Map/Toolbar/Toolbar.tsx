import { useGameState } from "../../../ContextProvider/GameStateContext/GameStateProvider";
import { Tools, useGameToolContext } from "../../../ContextProvider/GameToolProvider";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";

/**
 * Component that handles all the tools for an interactive map.
 */
export default function Toolbar() {
  const toolContext = useGameToolContext();
  const gamestate = useGameState();
  const authContext = useAuthenticatedContext();

  const amIHost = () => {
    return gamestate.getCurrentHostId() === authContext.user.id;
  };
  const toolConfirmationNeeded = (): boolean => {
    if (toolContext.curTool === Tools.FOG) return true;

    return false;
  };

  return (
    <>
      <div className="w-100 h-100 justify-content-between d-flex">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-secondary ${toolContext.curTool === Tools.SELECT ? "active" : ""} ${amIHost() ? "" : ""}`}
            onClick={() => {
              toolContext.setTool(Tools.SELECT);
            }}
          >
            <i className="bi bi-cursor fs-3"></i>
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${toolContext.curTool === Tools.FOG ? "active" : ""} ${amIHost() ? "" : "d-none"}`}
            onClick={() => {
              toolContext.setTool(Tools.FOG);
            }}
          >
            <i className="bi bi-cloud fs-3"></i>
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${toolContext.curTool === Tools.VISIBILITY ? "active" : ""} ${amIHost() ? "" : "d-none"}`}
            onClick={() => {
              toolContext.setTool(Tools.VISIBILITY);
            }}
          >
            <i className="bi bi-eye fs-3"></i>
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${toolContext.curTool === Tools.DELETE ? "active" : ""} ${amIHost() ? "" : ""}`}
            onClick={() => {
              toolContext.setTool(Tools.DELETE);
            }}
          >
            <i className="bi bi-trash fs-3"></i>
          </button>
        </div>

        {/* Submit */}
        {toolConfirmationNeeded() ? (
          <div className="btn-group mx-3" role="group" aria-label="Basic example">
            <button
              type="button"
              className={`btn btn-success ${toolConfirmationNeeded() ? "" : "disabled"}`}
              onClick={() => {
                toolContext.submitCurrentTool();
              }}
            >
              Submit
            </button>
            <button
              type="button"
              className={`btn btn-danger ${toolConfirmationNeeded() ? "" : "disabled"}`}
              onClick={() => {
                toolContext.setTool(Tools.SELECT);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
