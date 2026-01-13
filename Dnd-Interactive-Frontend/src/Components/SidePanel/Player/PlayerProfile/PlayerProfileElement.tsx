import { throttle } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { Player } from "../../../../shared/Player";
import StatusDropdown from "../../../StatusModal/StatusModal";
import { CharacterStatus } from "../../../../shared/StatusTypes";

export default function PlayerProfilePanelElement({ }: {}) {
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();

  const [avatarUri, setAvatarUri] = useState<string>("");
  const [name, setName] = useState<string>("")
  const [color, setColor] = useState<string>("");
  const [statuses, setStatuses] = useState<CharacterStatus[]>([]);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

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
    const handleStatusChange = (val: any) => {
      setStatuses(val.detail.val);
    };

    setAvatarUri(player.avatarUri);
    setName(player.name);
    setColor(player.color);
    setStatuses(player.statuses);

    window.addEventListener(`update-${player.userId}-name`, handleNameChange);
    window.addEventListener(`update-${player.userId}-avatarUri`, handleAvatarUrlChange);
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    window.addEventListener(`update-${player.userId}-statuses`, handleStatusChange);

    return () => {
      window.removeEventListener(`update-${player.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${player.userId}-avatarUri`, handleAvatarUrlChange);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
      window.removeEventListener(`update-${player.userId}-statuses`, handleStatusChange);
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
        <div className="d-flex w-100 align-items-center mb-2">
          <p className="flex-grow-1 text-center">{name}</p>
          <button className="btn btn-primary p-0" style={{ width: "35px", height: "35px" }} onClick={() => {
            setShowStatusModal(true);
          }}>
            <i className="bi bi-magic"></i>
          </button>
        </div>
        <input
          type="color"
          className="w-100"
          value={color}
          onChange={(e) => {
            sendColorChange(e.target.value);
          }}
        />
      </div>
      {
        showStatusModal ?
          <StatusDropdown
            onSubmit={(result: string[]): void => {
              authContext.room.send("setPlayerStatuses", { statuses: result });
              setShowStatusModal(false);
            }}
            onClose={() => { setShowStatusModal(false); }}
            selectedStatuses={statuses.map((ele: CharacterStatus): string => ele.status)}
          />
          : ""
      }
    </div>
  );
}
