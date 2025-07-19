import { Player } from "dnd-interactive-shared";
import { throttle } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import TextToInput from "../../../TextToInput/TextToInput";
import { HealDamageComponent } from "../../General/HealthDeathTracker/HealthComponent";

export default function PlayerStatsPanelComponent({ player }: { player: Player }) {
  const [name, setName] = useState<string>(player.name);
  const [avatarUrl, setAvatarUrl] = useState<string>(player.avatarUri);
  const [health, setHealth] = useState<number>(player.health);
  const [totalHp, setTotalHp] = useState<number>(player.totalHealth);
  const [color, setColor] = useState<string>(player.color);
  const authContext = useAuthenticatedContext();

  useEffect(() => {
    const handleNameChange = (val: any) => {
      setName(val.detail.val);
    };
    const handleAvatarUrlChange = (val: any) => {
      setAvatarUrl(val.detail.val);
    };
    const handleHealthChange = (val: any) => {
      setHealth(val.detail.val);
    };
    const handleTotalHpChange = (val: any) => {
      setTotalHp(val.detail.val);
    };
    const handleColorChange = (val: any) => {
      setColor(val.detail.val);
    };
    window.addEventListener(`update-${player.userId}-name`, handleNameChange);
    window.addEventListener(`update-${player.userId}-avatarUri`, handleAvatarUrlChange);
    window.addEventListener(`update-${player.userId}-health`, handleHealthChange);
    window.addEventListener(`update-${player.userId}-totalHealth`, handleTotalHpChange);
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);

    return () => {
      window.removeEventListener(`update-${player.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${player.userId}-avatarUri`, handleAvatarUrlChange);
      window.removeEventListener(`update-${player.userId}-health`, handleHealthChange);
      window.removeEventListener(`update-${player.userId}-totalHealth`, handleTotalHpChange);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
    };
  }, [authContext.room]);

  const sendColorChange = useCallback(
    throttle((val: string) => {
      authContext.room.send("changePlayerColor", { color: val });
    }, 200),
    []
  );

  return (
    <div className="container-fluid h-100">
      <div className="h-auto row mb-2">
        <div className="col-3 d-flex justify-content-center align-items-center">
          <img className="img-fluid rounded-circle overflow-hidden" style={{ maxHeight: "100%", border: `3px solid ${color}` }} src={`${avatarUrl}`} />
        </div>
        <div className="col-3 d-flex flex-column justify-content-center align-items-center">
          <HealDamageComponent
            DamageClick={(val: number) => {
              authContext.room.send("playerDamage", { damage: val, clientToChange: authContext.user.id });
            }}
            HealthClick={(val: number) => {
              authContext.room.send("playerHeal", { heal: val, clientToChange: authContext.user.id });
            }}
          />
        </div>
        <div className="col d-flex flex-column justify-content-center align-items-center">
          <p className="w-100 text-center">{name}</p>
          <div className="row h-auto w-100 d-flex justify-content-center align-items-center">
            <div className="col-4 p-0">
              <p className="text-center text-success">HP</p>
              <TextToInput
                onSubmit={(val: string) => {
                  authContext.room.send("changePlayerHp", { hp: +val });
                }}
                type="number"
                value={`${health}`}
              />
            </div>
            <div className="col-2 d-flex justify-content-center align-items-center p-0">
              <p className="text-center">/</p>
            </div>
            <div className="col-4 p-0">
              <p className="text-center text-warning">THP</p>
              <TextToInput
                onSubmit={(val: string) => {
                  authContext.room.send("changePlayerTotalHp", { totalHp: +val });
                }}
                type="number"
                value={`${totalHp}`}
              />
            </div>
          </div>
        </div>
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
  );
}
