import { throttle } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { Player } from "../../../../shared/Player";

export default function PlayerProfilePanelElement({ }: {}) {
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();

  const [avatarUri, setAvatarUri] = useState<string>("");
  const [name, setName] = useState<string>("")
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    const player: Player | undefined = playerContext.getPlayer(authContext.user.id);
    if (player == null) return;

    const handleNameChange = (val: any) => {
      setName(val.detail.val);
    };
    const handleAvatarUrlChange = (val: any) => {
      setAvatarUri(val.detail.val);
    };
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };

    setAvatarUri(player.avatarUri);
    setName(player.name);
    setColor(player.color);

    window.addEventListener(`update-${player.userId}-name`, handleNameChange);
    window.addEventListener(`update-${player.userId}-avatarUri`, handleAvatarUrlChange);
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);

    return () => {
      window.removeEventListener(`update-${player.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${player.userId}-avatarUri`, handleAvatarUrlChange);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
    };
  }, [authContext.user, authContext.room]);

  const sendColorChange = useCallback(
    throttle((val: string) => {
      authContext.room.send("changePlayerColor", { color: val });
    }, 200),
    []
  );

  return (
    <div className="container-fluid d-flex py-2 border-bottom border-secondary">
      <div className="me-4" style={{ width: "100px" }}>
        <img className="img-fluid rounded-circle overflow-hidden" style={{ maxHeight: "100%", border: `3px solid ${color}` }} src={`${avatarUri}`} />
      </div>
      <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center">
        <p className="w-100 text-center">{name}</p>
        <input
          type="color"
          className="w-100"
          value={color}
          onChange={(e) => {
            sendColorChange(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
