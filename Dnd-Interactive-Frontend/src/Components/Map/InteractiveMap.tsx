import { MapData } from "../../../src/shared/Map";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, Pane } from "react-leaflet";
import { usePlayers } from "../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import DrawArc from "./DrawingTools/Arc/DrawArc";
import DrawCircle from "./DrawingTools/Circle/DrawCircle";
import DrawCube from "./DrawingTools/Cube/DrawCube";
import DrawLine from "./DrawingTools/Lines/DrawLine";
import EnemyMarkerList from "./PlayableMarkers/Enemy/EnemyMarkerList";
import FogCreation from "./Fog/FogCreation";
import ShowFog from "./Fog/ShowFog";
import PlayerMarkerList from "./PlayableMarkers/Player/PlayerMarkerList";

/**
 * Component responsible for rendering an interactive map. This will contain everything necessary for an interactive map.
 */
export default function InteractiveMap({ map }: { map: MapData }) {
  const players = usePlayers();
  const authContext = useAuthenticatedContext();
  const [nMap, setMap] = useState<MapData>(map);

  useEffect(() => {
    setMap(map);
  }, [map]);
  // changes the enemy z-index, if host the marker should show above fogs and if a client should be hidden by the fog.
  const enemyZindex = React.useCallback(() => {
    const curPlayer = players.getPlayer(authContext.user.id);
    if (curPlayer === undefined) return; // This should never happen but checking anyways
    if (curPlayer.isHost) return 599;

    return 597;
  }, []);

  return (
    <>
      <div className="w-100 h-100 overflow-hidden" style={{ background: "pink" }}>
        <MapContainer
          className="h-100 w-100"
          center={[nMap.height / 2, nMap.width / 2]}
          minZoom={-100}
          maxZoom={50}
          crs={L.CRS.Simple} // Use Simple CRS for non-geographic images
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
          markerZoomAnimation={false}
          bounds={[
            [0, 0],
            [nMap.height, nMap.width],
          ]}
          style={{ background: "grey", userSelect: "none" }}
          zoomSnap={0.1}
          zoomDelta={0.1}
          fadeAnimation={false}
        >
          <ImageOverlay
            url={`/colyseus/getImage/${nMap.mapBase64}`}
            bounds={[
              [0, 0],
              [nMap.height, nMap.width],
            ]}
          ></ImageOverlay>
          <PlayerMarkerList />
          {/* Zindex for host is 599 while user is 597 */}
          <Pane name="Enemy" style={{ zIndex: enemyZindex() }}>
            <EnemyMarkerList />
          </Pane>
          <DrawLine player={players.getPlayer(authContext.user.id)!} />
          <DrawCube />
          <DrawCircle />
          <DrawArc />
          <Pane name="fog" style={{ zIndex: 598 }}>
            <ShowFog />
          </Pane>
          <FogCreation />
        </MapContainer>
      </div>
    </>
  );
}
