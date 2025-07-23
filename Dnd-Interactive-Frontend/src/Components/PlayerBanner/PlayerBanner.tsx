import { Player } from "../../../src/shared/Player";
import { useEffect, useState } from "react";
import { useGameState } from "../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import Modal from "../Modal/Modal";
import "./BannerHover.css";

/**
 * Component that will display the player in the mainmenu.
 * TODO: This class needs some major formatting to look nice.
 */
export default function PlayerBanner({ player, isMain, hostOnClick }: { player: Player; isMain: boolean; hostOnClick?: () => void }) {
  const authContext = useAuthenticatedContext();
  const gameStateContext = useGameState();
  const [showModal, setShowModal] = useState<boolean>(false);

  const [name, setName] = useState<string>(player.name);
  const [currentHp, setCurrentHp] = useState<number>(player.health);
  const [totHp, setTotHp] = useState<number>(player.totalHealth);
  const [color, setColor] = useState<string>(player.color);
  const [curHostId, setCurHostId] = useState<string | undefined>(gameStateContext.getCurrentHostId());
  const [currentlyConnected, setConnected] = useState<boolean>(player.isConnected);

  useEffect(() => {
    const handleNameChange = (val: any) => {
      setName(val.detail.val);
    };

    const handleTotHpChange = (val: any) => {
      setTotHp(val.detail.val);
    };

    const handlePlayerColorChange = (val: any) => {
      setColor(val.detail.val);
    };

    const handleCharacterHealth = (val: any) => {
      setCurrentHp(val.detail.val);
    };

    const handleHostIdChange = (val: any) => {
      setCurHostId(val.detail.val);
    };

    const handleConnectionChange = (val: any) => {
      setConnected(val.detail.val);
    };

    window.addEventListener(`update-${player.userId}-name`, handleNameChange);
    window.addEventListener(`update-${player.userId}-totalHealth`, handleTotHpChange);
    window.addEventListener(`update-${player.userId}-color`, handlePlayerColorChange);
    window.addEventListener(`update-${player.userId}-health`, handleCharacterHealth);
    window.addEventListener(`update-${player.userId}-isConnected`, handleConnectionChange);
    window.addEventListener(`HostIdChange`, handleHostIdChange);
    return () => {
      window.removeEventListener(`update-${player.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${player.userId}-totalHealth`, handleTotHpChange);
      window.removeEventListener(`update-${player.userId}-color`, handlePlayerColorChange);
      window.removeEventListener(`update-${player.userId}-health`, handleCharacterHealth);
      window.removeEventListener(`update-${player.userId}-isConnected`, handleConnectionChange);
      window.removeEventListener(`HostIdChange`, handleHostIdChange);
    };
  }, []);

  // Modal Hooks
  const [modalColor, setModalColor] = useState<string>(color);

  function HexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
      throw new Error("Could not parse Hex Color");
    }

    const rHex = parseInt(result[1], 16);
    const gHex = parseInt(result[2], 16);
    const bHex = parseInt(result[3], 16);

    const r = rHex / 255;
    const g = gHex / 255;
    const b = bHex / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = (max + min) / 2;
    let s = h;
    let l = h;

    if (max === min) {
      // Achromatic
      return { h: 0, s: 0, l };
    }

    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;

    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(360 * h);

    return { h, s, l };
  }

  function getLightenColor(hex: string) {
    const { h, s, l } = HexToHSL(hex);
    const min = 5;
    const max = 80;
    const lightenFactorPercentage = -15;

    let nLight = l + lightenFactorPercentage;
    nLight = Math.max(min, nLight);
    nLight = Math.min(max, nLight);

    return `hsl(${h}, ${s}%, ${nLight}%)`;
  }
  return (
    <>
      <div className="container-fluid d-flex flex-column justify-content-between h-100 rounded-5 pbBackground position-relative overflow-hidden" style={{ border: `3px solid ${color}`, backgroundColor: getLightenColor(color) }}>
        {!currentlyConnected ? (
          <div className="position-absolute d-flex justify-content-center align-items-center bg-danger" style={{ top: 0, bottom: 0, right: 0, left: 0, zIndex: 9999, opacity: "75%" }}>
            {/* Below Should be changed. This styling feels wrong */}
            <DisconnectImage />
          </div>
        ) : (
          ""
        )}

        {/* Image */}
        <div className={`w-100 my-1 position-relative p-1 ${isMain ? "px-md-5" : ""} justify-content-center d-flex`} style={{ maxHeight: isMain ? "50%" : "65%" }}>
          <img className="rounded-circle img-fluid" src={player.avatarUri} style={{ border: `3px solid ${color}` }} />
          {isMain ? (
            <img
              className="position-absolute rounded-circle img-fluid ImageOverlay p-1 px-md-5"
              src="Assets/placeholder.png"
              style={{
                top: "0px", // Adjust this according to the padding you need
                left: "50%", // Adjust this according to the padding you need
                maxWidth: "100%",
                maxHeight: "100%",
                transform: "translate(-50%, 0)",
              }}
              onClick={() => {
                setModalColor(color);
                setShowModal(true);
              }}
            />
          ) : (
            ""
          )}
        </div>
        <div className="w-100">
          {isMain && !curHostId ? (
            <button
              className="btn btn-warning w-100 fw-bolder"
              onClick={() => {
                if (hostOnClick) hostOnClick();
              }}
            >
              BECOME GOD!!
            </button>
          ) : (
            ""
          )}
        </div>
        <div className={`w-100 text-center mb-3 ${isMain ? "py-2" : ""} border border-3 border-dark-subtle bg-dark rounded`}>
          <p className="m-0 pb-1 h5 fw-bolder">{name}</p>
          <div className={`w-100 d-flex justify-content-center ${!isMain ? "d-none" : ""}`}>
            {/* HP values */}
            <div className="col-7 w-100 d-flex justify-content-center align-items-center row">
              <div className="col-5">
                <p className="m-0 text-success fw-bold">Current</p>
                <p className="m-0 fw-bold">{currentHp}</p>
              </div>
              <div className="col-2">
                <p className="m-0 fw-bold">/</p>
              </div>
              <div className="col-5">
                <p className="m-0 text-warning fw-bold">Total</p>
                <p className="m-0 fw-bold">{totHp}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal ? (
        <Modal
          Title="Character"
          closeCallback={() => {
            setShowModal(false);
          }}
          submitCallback={() => {
            setShowModal(false);
            authContext.room.send("changePlayerColor", { color: modalColor });
          }}
        >
          <div className="container-fluid">
            {/* Color Chooser */}
            <div className="mb-3">
              <input
                className="form-control"
                type="color"
                value={modalColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setModalColor(e.target.value);
                }}
              />
            </div>
          </div>
        </Modal>
      ) : (
        ""
      )}
    </>
  );
}

function DisconnectImage() {
  const [spacing, setSpacing] = useState<string>("");
  const maxSpacing = 10;
  useEffect(() => {
    const spacingInterval = setInterval(() => {
      setSpacing((prev) => {
        const spaces = prev + "         ";
        if (spaces.length > maxSpacing) {
          return "";
        }
        return spaces;
      });
    }, 1000);

    return () => {
      clearInterval(spacingInterval);
    };
  }, []);

  return (
    <div className="">
      <i className="bi bi-plug fs-1" />
      {spacing}
      <i className="bi bi-outlet fs-1" />
    </div>
  );
}
