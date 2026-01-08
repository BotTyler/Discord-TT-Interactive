import { Player } from "../../../../shared/Player";
import React, { useEffect, useState } from "react";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import DisplayArc from "../../DrawingTools/Arc/DisplayArc";
import DisplayCircle from "../../DrawingTools/Circle/DisplayCircle";
import DisplayCube from "../../DrawingTools/Cube/DisplayCube";
import DisplayLines from "../../DrawingTools/Lines/DisplayLines";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { MapMovementType } from "../../../../shared/State";
import GridMovementController from "../MovementControllers/GridMovementController";
import { LatLng } from "leaflet";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import FreeMovementController from "../MovementControllers/FreeMovementController";
import useDebounced from "../../../../Util/useDebounced";
import DisplayBeam from "../../DrawingTools/Beam/DisplayBeam";
import { Summons } from "../../../../shared/Summons";

export default function PlayerMarkerList() {
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();
  const gameStateContext = useGameState();
  const [playerList, setList] = useState<{ [key: string]: Player }>(playerContext.getAllPlayers());
  const [movementType, setMovementType] = useState<MapMovementType>(gameStateContext.getMapMovement());


  React.useEffect(() => {
    const updateList = (value: any) => {
      setList(value.detail.val);
    };

    const MovementTypeChanged = (value: any) => {
      setMovementType(value.detail.val);
    }

    window.addEventListener("PlayersChanged", updateList);
    window.addEventListener("MapMovementChanged", MovementTypeChanged);

    return () => {
      window.removeEventListener("PlayersChanged", updateList);
      window.removeEventListener("MapMovementChanged", MovementTypeChanged);
    };
  }, []);

  const debouncePositionChange = useDebounced((player: Player, toPosition: LatLng) => {
    authContext.room.send("updatePosition", { pos: toPosition, clientToChange: player.userId });
  }, 100)

  const debounceGhostPositionChange = useDebounced((player: Player, toPosition: LatLng[]) => {
    authContext.room.send("updatePlayerGhostPosition", { pos: toPosition, clientToChange: player.userId });
  }, 100)

  const getControllerElement = (player: Player): any => {
    switch (movementType) {
      case "free":
        return <FreeMovementController userType="player" controllableUser={player}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(player, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(player, toPosition) }} />;
      case "grid":
        return <GridMovementController userType="player" controllableUser={player}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(player, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(player, toPosition) }} />;
      default:
        return <FreeMovementController userType="player" controllableUser={player}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(player, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(player, toPosition) }} />;
    }
  }


  return (
    <>
      {Object.values(playerList).map((player, index) => {
        return (
          <div key={`PlayerElements-${player.userId}`}>
            <DisplayLines player={player} />
            <DisplayCube player={player} />
            <DisplayCircle player={player} />
            <DisplayArc player={player} />
            <DisplayBeam player={player} />
            {getControllerElement(player)}
            <SummonsControllerListElement _player={player} />
          </div>
        );
      })}
    </>
  );
}

function SummonsControllerListElement({ _player }: { _player: Player }) {
  const authContext = useAuthenticatedContext();
  const gameStateContext = useGameState();

  const [player, setPlayer] = useState<Player>(_player);
  const [movementType, setMovementType] = useState<MapMovementType>(gameStateContext.getMapMovement());

  const [summons, setSummons] = useState<Summons[]>(_player.summons);

  useEffect(() => {
    setPlayer(player);
  }, [_player]);

  useEffect(() => {
    const handleSummonsChange = (val: any): void => {
      setSummons(val.detail.val);
    }

    const MovementTypeChanged = (value: any) => {
      setMovementType(value.detail.val);
    }

    window.addEventListener(`update-${player.userId}-summons`, handleSummonsChange);
    window.addEventListener("MapMovementChanged", MovementTypeChanged);
    return () => {
      window.removeEventListener(`update-${player.userId}-summons`, handleSummonsChange);
      window.removeEventListener("MapMovementChanged", MovementTypeChanged);
    }
  }, [player]);

  const debouncePositionChange = useDebounced((summons: Summons, toPosition: LatLng) => {
    authContext.room.send("updateSummonsPosition", { pos: toPosition, id: summons.id, player_id: player.userId });
  }, 100)

  const debounceGhostPositionChange = useDebounced((summons: Summons, toPosition: LatLng[]) => {
    authContext.room.send("updateSummonsGhostPosition", { pos: toPosition, id: summons.id, player_id: player.userId });
  }, 100)

  const getControllerElement = (summons: Summons): any => {
    switch (movementType) {
      case "free":
        return <FreeMovementController userType="summon" controllableUser={summons}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(summons, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(summons, toPosition) }} />;
      case "grid":
        return <GridMovementController userType="summon" controllableUser={summons}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(summons, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(summons, toPosition) }} />;
      default:
        return <FreeMovementController userType="summon" controllableUser={summons}
          onPositionChange={(toPosition: LatLng) => { debouncePositionChange(summons, toPosition) }}
          onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(summons, toPosition) }} />;
    }
  }

  return (
    <>
      {summons.map((val: Summons) => {
        <div key={`SummonControlElement-${val.id}`}>
          {getControllerElement(val)}
        </div>
      })};
    </>
  )
}
