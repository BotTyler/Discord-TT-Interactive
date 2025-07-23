import { Player } from "../../../../src/shared/Player";
import L, { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { useGameState } from "../../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";
import PlayerMarker from "./PlayerMarkerRef";

/**
 * Component that is responsible for all functions of a player on an interactive map.
 */
export default function PlayerController({ player }: { player: Player }) {
  const authContext = useAuthenticatedContext();
  const mapContext = useGameState();

  const [name, setName] = useState<string>(player.name);
  const [position, setPosition] = useState<LatLng>(new LatLng(player.position.lat, player.position.lng));
  const [iconSize, setSize] = useState<number>(mapContext.getIconHeight());
  const [update, setUpdate] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(player.isConnected);
  const [color, setColor] = useState<string>(player.color);
  const [isHost, setIsHost] = useState<boolean>(player.isHost);

  useEffect(() => {
    const setNewPosition = (value: any) => {
      setPosition(value.detail.val);
    };

    const handleNameChange = (value: any) => {
      setName(value.detail.val);
    }
    const handleIconHeightChange = (value: any) => {
      setSize(value.detail.val);
    };
    const handleConnectionChange = (value: any) => {
      setConnected(value.detail.val);
    };
    const handleColorChange = (value: any) => {
      setColor(value.detail.val);
    };
    const handleIsHostChange = (value: any) => {
      setIsHost(value.detail.val);
    };

    window.addEventListener(`update-${player.userId}-isConnected`, handleConnectionChange);
    window.addEventListener(`update-${player.userId}-name`, handleNameChange);
    window.addEventListener(`update-${player.userId}-position`, setNewPosition);
    window.addEventListener(`IconHeightChanged`, handleIconHeightChange);
    window.addEventListener(`update-${player.userId}-color`, handleColorChange);
    window.addEventListener(`update-${player.userId}-isHost`, handleIsHostChange);

    const moveStatus = authContext.room.onMessage(`MovementConfirmation${player.userId}`, (status: boolean) => {
      if (status) return;
      setUpdate((prev) => {
        return !prev;
      });
    });

    return () => {
      window.removeEventListener(`update-${player.userId}-isConnected`, handleConnectionChange);
      window.removeEventListener(`update-${player.userId}-name`, handleNameChange);
      window.removeEventListener(`update-${player.userId}-position`, setNewPosition);
      window.removeEventListener(`IconHeightChanged`, handleIconHeightChange);
      window.removeEventListener(`update-${player.userId}-color`, handleColorChange);
      window.removeEventListener(`update-${player.userId}-isHost`, handleIsHostChange);

      moveStatus();
    };
  }, [player, authContext.room.state.map]);
  return isConnected && !isHost ? <PlayerMarker playerId={player.userId} name={name} playerAvatar={player.avatarUri} size={iconSize} position={L.latLng(position.lat, position.lng)} color={color} key={`MovementMarkerController-${player.userId}`} /> : "";
}
