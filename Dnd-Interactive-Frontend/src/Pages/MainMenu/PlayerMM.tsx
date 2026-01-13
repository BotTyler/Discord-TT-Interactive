import { Player } from "../../../src/shared/Player"
import React, { useEffect, useState } from "react";
import PlayerBanner from "../../Components/PlayerBanner/PlayerBanner";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";

export default function PlayerMM({ currentPlayer, otherPlayers }: { currentPlayer: Player; otherPlayers: Player[] }) {
  const [me, setMe] = useState<Player>(currentPlayer);
  const [others, setOthers] = useState<Player[]>(otherPlayers);
  const authContext = useAuthenticatedContext();

  function setHost() {
    authContext.room.send("setHost");
  }
  useEffect(() => {
    setMe(currentPlayer);
  }, [currentPlayer]);
  useEffect(() => {
    setOthers(otherPlayers);
  }, [otherPlayers]);

  const getPlayerDispaly = (index: number) => {
    const player = others[index];
    return (
      <div className="d-flex py-1 justify-content-center align-items-center h-100">
        {player ? (
          <PlayerBanner player={player} isMain={false} key={`PlayerMMBanner-Other-${player.userId}-${index}`} hostOnClick={() => { }} />
        ) : (
          <div className="h-100 w-100 border-3 text-center justify-content-center d-flex flex-column border rounded-5 bg-dark bg-opacity-75 border-dark">
            <WaitingComponent />
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="h-75 row justify-content-center align-items-center">
      {/* Other Player Container 1 */}
      <div className="col-4 h-75 d-none d-xl-block">
        <div className="row h-50 align-items-center justify-content-center">
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 1 */}
            {getPlayerDispaly(0)}
          </div>
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 2 */}
            {getPlayerDispaly(1)}
          </div>
        </div>
        <div className="row h-50 align-items-center justify-content-center">
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 4 */}
            {getPlayerDispaly(2)}
          </div>
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 5 */}
            {getPlayerDispaly(3)}
          </div>
        </div>
      </div>
      {/* Main Player Container */}
      <div className="col-8 col-xl-3 h-100 overflow-hidden">
        <PlayerBanner
          player={me}
          isMain={true}
          hostOnClick={() => {
            setHost();
          }}
        />
      </div>
      {/* Other Player Container 2 */}
      <div className="col-4 h-75 d-none d-xl-block">
        <div className="row h-50 align-items-center justify-content-center">
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 1 */}
            {getPlayerDispaly(4)}
          </div>
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 2 */}
            {getPlayerDispaly(5)}
          </div>
        </div>
        <div className="row h-50 align-items-center justify-content-center">
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 4 */}
            {getPlayerDispaly(6)}
          </div>
          <div className="col-6 h-100 overflow-hidden">
            {/* Player 5 */}
            {getPlayerDispaly(7)}
          </div>
        </div>
      </div>
    </div>
  );
}

function WaitingComponent() {
  const [dots, setDots] = useState<string>("");

  React.useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";

        return prev + ".";
      });
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
    };
  }, []);
  return <p className="text-break fw-bold fs-4">Waiting {dots}</p>;
}
