import { Player } from "../../../../shared/Player";
import React, { useState } from "react";
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
    // switch(movementType){
    //   case "free":
    //     authContext.room.send("updatePlayerGhostPosition", {pos: toPosition, clientToChange: player.userId});
    //   break;
    //   case "grid":
    //     authContext.room.send("updatePlayerGhostPosition", {pos: toPosition, clientToChange: player.userId})
    //   break;
    //   default:
    //     authContext.room.send("updatePlayerGhostPosition", {pos: toPosition, clientToChange: player.userId});
    //   break;
    // }
  }, 100)
    
  const getControllerElement = (player: Player): any => {
    switch (movementType) {
      case "free":
        return <FreeMovementController isPlayer={true} controllableUser={player} 
        onPositionChange={(toPosition: LatLng) => { debouncePositionChange(player, toPosition) }} 
        onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(player, toPosition) }} />;
      case "grid":
        return <GridMovementController isPlayer={true} controllableUser={player} 
        onPositionChange={(toPosition: LatLng) => { debouncePositionChange(player, toPosition) }} 
        onGhostPositionChange={(toPosition: LatLng[]) => { debounceGhostPositionChange(player, toPosition) }} />;
      default:
        return <FreeMovementController isPlayer={true} controllableUser={player} 
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
            {getControllerElement(player)}
          </div>
        );
      })}
    </>
  );
}
