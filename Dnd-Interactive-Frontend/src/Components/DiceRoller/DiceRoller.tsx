import React, { useImperativeHandle } from "react";
// @ts-ignore
import DiceBox from "@3d-dice/dice-box";
// @ts-ignore
import { useMessageContext } from "../../ContextProvider/Messages/MessageContextProvider";
import { usePlayers } from "../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import "./diceBox.css";
import DicePickerComponent from "./DicePickerComponent";

export const DiceRoller = React.forwardRef(function DiceRoller({ fullScreen }: { fullScreen: boolean }, ref: any) {
  const diceBoxRef = React.useRef(null);
  const [dice, setDice] = React.useState<DiceBox>(undefined);
  const [refresh, setRefresh] = React.useState<boolean>(false);
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();
  const messageContext = useMessageContext();

  useImperativeHandle(ref, () => ({
    refresh() {
      if (dice == undefined) return;
      if (refresh === true) return;
      setRefresh(true);
    },
  }), [refresh]);

  // Initialize the dicebox
  React.useEffect(() => {
    async function setup() {
      const ds = new DiceBox({
        id: "dice-canvas", // canvas element id
        assetPath: "/.proxy/assets/",
        container: "#dice-box",
        startingHeight: 8,
        throwForce: 6,
        spinForce: 5,
        lightIntensity: 0.9,
        fullScreen: false,
      });
      await ds.init();

      // pass dice rolls to Advanced Roller to handle
      ds.onRollComplete = (results: any) => {
        const notation: string[] = [];
        const addValues: string[] = [];
        var sum = 0;

        results.forEach((diceType: any) => {
          notation.push(`${diceType.qty}d${diceType.sides}`);
          sum += diceType.value;
          diceType.rolls.forEach((dice: any) => {
            addValues.push(dice.value);
          });
        });
        const body = `${addValues.join(" + ")} = ${sum}`;
        // Roll is now complete, I am going to send the message depending on the status of the user;
        const me = playerContext.getPlayer(authContext.user.id)!; // Force unwrap is ok as it should be the current player.
        if (me.isHost) {
          messageContext.sendHostMessage(body);
        } else {
          messageContext.sendAllMessage(body);
        }

        ds.clear();
      };
      setDice(ds);
      setRefresh(false);
    }
    if (diceBoxRef.current) setup();
  }, [refresh]);

  return (
    <div className="w-100 h-100 position-relative">
      <div className="w-100 h-100" style={{ background: "purple" }}>
        <div className={`${fullScreen ? "fullScreen" : "DiceCustom"} dice-tray`} id="dice-box" ref={diceBoxRef}></div>
      </div>

      {/* Dice Selector */}
      <div className="position-absolute" style={{ right: "10px", bottom: "10px" }}>
        <DicePickerComponent
          startRoll={(notion: string[]) => {
            dice.roll(notion);
          }}
        />
      </div>
    </div>
  );
});
