import React from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";

export default function PlayerSizeInput() {
  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
  const [size, setSize] = React.useState(mapContext.getIconHeight());
  const handleSubmit = React.useCallback(
    (e: React.MouseEvent) => {
      // submit is called send this to the server
      authContext.room.send("setPlayerSize", { size: size });
    },
    [size]
  );
  React.useEffect(() => {
    const handleIconSizeUpdate = (value: any) => {
      setSize(value.detail.val);
    };
    window.addEventListener(`IconHeightChanged`, handleIconSizeUpdate);
    return () => {
      window.addEventListener(`IconHeightChanged`, handleIconSizeUpdate);
    };
  }, []);

  return (
    <div className="input-group mb-3">
      <span className="input-group-text" id="basic-addon1">
        Player Size
      </span>
      <input
        type="number"
        className="form-control"
        value={size}
        onChange={(e) => {
          setSize(+e.target.value);
        }}
      />
      <span className="input-group-text btn btn-primary" id="basic-addon1" onClick={handleSubmit}>
        E
      </span>
    </div>
  );
}
