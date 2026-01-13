import React from "react";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";

export default function PlayerSizeInput() {
  const mapContext = useGameState();
  const authContext = useAuthenticatedContext();
  const [size, setSize] = React.useState(mapContext.getIconHeight());
  const handleSubmit = React.useCallback(
    () => {
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
    <input
      type="number"
      className="form-control"
      value={size}
      onChange={(e) => {
        setSize(+e.target.value);
      }}
      onClick={(e) => {
        const target: any = e.target;
        target.select();
      }}
      onBlur={handleSubmit}
    />
  );
}
