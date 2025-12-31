import { Player } from "../../../../../src/shared/Player"
import { useEffect, useRef, useState } from "react";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import Modal from "../../../Modal/Modal";
import { NewLoadImage } from "../../../NewLoadImage/NewLoadImage";
import PlayerBanner from "../../../PlayerBanner/PlayerBanner";

export default function HandoutsPanel() {
  const authContext = useAuthenticatedContext();
  const [tempHandoutPreview, setTempPreview] = useState<string>(`Assets/placeholder.png`);

  const newloadImageRef = useRef<any>(null);
  const [isHandoutShowing, setHandoutShowing] = useState<boolean>(false);

  return (
    <>
      <div className="container-fluid h-100 d-flex flex-column">
        {/* load save buttons */}
        <div className="w-100">
          <NewLoadImage
            startingImageSrc={`Assets/placeholder.png`}
            imgSrcPrefix=""
            ref={newloadImageRef}
            showPreview={false}
            onChange={(imageUrl: string) => {
              setTempPreview(imageUrl);
            }}
          />
        </div>
        {/* Content Display */}
        <div style={{ height: "1px", flex: "1 1 auto" }} className="d-flex justify-content-center align-items-center mb-3">
          <img alt="Handout preview image" src={tempHandoutPreview} className="img-fluid" style={{ maxHeight: "100%" }} />
        </div>
        {/* Handout Button */}
        <div className="w-100">
          <button
            className="btn btn-primary w-100"
            onClick={() => {
              setHandoutShowing(true);
            }}
          >
            HANDOUT
          </button>
        </div>
      </div>
      {isHandoutShowing ? (
        <HandoutListModal
          onSubmit={async (playerIds: string[]) => {
            if (!newloadImageRef.current) return;
            const imageSrc = await newloadImageRef.current.getMinioFileUrl();
            if (!imageSrc) {
              setHandoutShowing(false);
              return;
            }
            // everything is ready, lets send the request to the server
            authContext.room.send("BroadcastHandout", { playerIds: playerIds, imageUrl: imageSrc });
            setHandoutShowing(false);
          }}
          onCancel={() => {
            setHandoutShowing(false);
          }}
        />
      ) : (
        ""
      )}
    </>
  );
}

export function HandoutListModal({ onSubmit, onCancel }: { onSubmit: (selectedPlayersId: string[]) => void; onCancel: () => void }) {
  const players = usePlayers();
  const [playerList, setPlayerList] = useState<{ [key: string]: Player }>(players.getAllPlayers());
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const handlePlayerListChange = (val: any) => {
      setPlayerList(val.detail.val);
    };
    window.addEventListener("PlayersChanged", handlePlayerListChange);
    return () => {
      window.removeEventListener("PlayersChanged", handlePlayerListChange);
    };
  }, []);

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    setSelected((prev) => {
      if (checked) return [...prev, userId];

      // we need to filter the userId
      return prev.filter((val) => val !== userId);
    });
  };
  return (
    <Modal
      Title="Enemy"
      closeCallback={() => {
        onCancel();
      }}
      submitCallback={async () => {
        onSubmit(selected);
      }}
    >
      <div className="container-fluid w-100 h-100">
        <div className="overflow-auto">
          {Object.values(playerList).map((player: Player) => {
            return (
              <div
                className="input-group mb-3 row"
                key={`Handout-Player-Element-${player.userId}`}
                onClick={() => {
                  handleCheckboxChange(player.userId, !selected.includes(player.userId));
                }}
              >
                <div className="col" style={{ maxHeight: "150px" }}>
                  <PlayerBanner isMain={false} player={player} />
                </div>
                <div className="input-group-text col-2">
                  <input
                    className="form-check-input mt-0"
                    type="checkbox"
                    onChange={(e) => {
                      e.preventDefault();
                    }}
                    checked={selected.includes(player.userId)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
