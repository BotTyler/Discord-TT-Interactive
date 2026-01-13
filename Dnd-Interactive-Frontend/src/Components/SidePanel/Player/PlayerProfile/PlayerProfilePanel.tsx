import PlayerProfilePanelElement from "./PlayerProfileElement";
import PlayerSummonsElement from "./PlayerSummonsElement";

export default function PlayerProfilePanel({ }: {}) {

  return (
    <div className="w-100 h-100 d-flex flex-column">
      <div className="">
        <PlayerProfilePanelElement />
      </div>

      <h5 className="m-0 mt-2"><u>Summons</u></h5>
      <div className="flex-grow-1">
        <PlayerSummonsElement />
      </div>

    </div>
  )
}
