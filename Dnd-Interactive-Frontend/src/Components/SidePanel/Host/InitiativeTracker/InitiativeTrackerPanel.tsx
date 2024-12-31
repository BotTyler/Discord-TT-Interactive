import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import InitiativeListHandler from "./InitiativeListHandler";
export default function InitiativeTrackerPanel() {
  const authContext = useAuthenticatedContext();
  return (
    <div className="container-fluid p-0">
      <div className="btn-group w-100" role="group" aria-label="Basic example">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            authContext.room.send("resetInitiativeIndex");
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            authContext.room.send("nextInitiativeIndex");
          }}
        >
          Next
        </button>
      </div>
      <ul className="list-group">
        <InitiativeListHandler />
      </ul>
    </div>
  );
}
