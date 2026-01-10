import { UUID } from "crypto";
import { DivIcon, LatLng, LeafletEventHandlerFnMap } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import "./MarkerFormatting.css"
import { renderToStaticMarkup } from "react-dom/server";

export type CHARACTER_STATUS_TYPE =
  "BLINDED"
  | "CHARMED"
  | "DEAFENED"
  | "EXHAUSTION"
  | "FRIGHTENED"
  | "GRAPPLED"
  | "INCAPACITATED"
  | "PARALYZED"
  | "PETRIFIED"
  | "POISONED"
  | "PRONE"
  | "RESTRAINED"
  | "STUNNED"
  | "UNCONSCIOUS"


export default function MarkerDisplay(
  { name,
    size,
    avatarURI,
    position,
    color,
    health,
    totalHealth,
    className = "",
    isDraggable = false,
    displayName = true,
    eventFunctions }:
    {
      name: string;
      size: number;
      avatarURI: string;
      position: LatLng;
      color: string;
      health: number;
      totalHealth: number;
      className: string;
      isDraggable?: boolean;
      displayName?: boolean;
      eventFunctions?: LeafletEventHandlerFnMap
    }) {

  const map = useMap();

  const [markerName, setName] = useState<string>(name);
  const [markerScaled, setScaled] = useState([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]);
  const [markerAvatar, setAvatar] = useState<string>(avatarURI);
  const [markerPosition, setPosition] = useState<LatLng>(position);
  const [markerColor, setColor] = useState<string>(color);
  const [markerHealth, setMarkerHealth] = useState<number>(health)
  const [markerTotalHealth, setMarkerTotalHealth] = useState<number>(totalHealth);
  const [id, setId] = useState<UUID>(crypto.randomUUID());
  const [statuses, setStatuses] = useState<CHARACTER_STATUS_TYPE[]>(["BLINDED", "CHARMED", "DEAFENED", "EXHAUSTION", "FRIGHTENED"]);

  useEffect(() => {
    setName(name);
  }, [name])
  useEffect(() => {
    setScaled([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]);
  }, [size])
  useEffect(() => {
    setAvatar(avatarURI);
  }, [avatarURI]);
  useEffect(() => {
    setPosition(position);
  }, [position])
  useEffect(() => {
    setColor(color);
  }, [color])
  useEffect(() => {
    setMarkerHealth(health);
  }, [health])
  useEffect(() => {
    setMarkerTotalHealth(totalHealth);
  }, [totalHealth])

  useEffect(() => {
    const zoomEnd = () => {
      const zoom = map.getZoom();
      const newSize = markerScaled[1] * map.getZoomScale(zoom, markerScaled[0]);
      setScaled([zoom, newSize]);
    };

    map.on("zoomend", zoomEnd);
    return () => {
      map.off("zoomend", zoomEnd);
    };
  }, [map, markerScaled]);
  const divIconElement =
    (
      <div className="w-100 h-100 position-relative marker-container">
        <img
          src={markerAvatar}
          alt="marker-icon"
          style={{ width: '100%', height: "100%", objectFit: "cover", border: `3px solid ${markerColor}` }}
          className={`rounded-circle ${className}`}
        />
        <div className="position-absolute"
          style={{ top: 0, left: 0, right: 0, bottom: 0, background: "transparent" }}
        >
        </div>
        <div className="markerNameTagDiv text-center icon-text">
          {displayName ?
            (
              <p className="text-nowrap text-capitalize text-break m-0 p-1" style={{ color: "#fff", zIndex: 0, fontSize: "12px" }}>
                {markerName}
              </p>
            )
            : ""
          }
        </div>
        {displayName ? (
          <div className="markerStatusBox">
            <div className="statusImageDiv statusImageDiv1">
              <img
                className="rounded-circle img-fluid"
                src="Assets/placeholder.png"
              />
            </div>
            <div className="statusImageDiv statusImageDiv2">
              <img
                className="rounded-circle img-fluid"
                src="Assets/placeholder.png"
              />
            </div>
            <div className="statusImageDiv statusImageDiv3">
              <img
                className="rounded-circle img-fluid"
                src="Assets/placeholder.png"
              />
            </div>
            <div className="statusImageDiv statusImageDiv4">
              <img
                className="rounded-circle img-fluid"
                src="Assets/placeholder.png"
              />
            </div>
            <div className="statusImageDiv statusImageDiv5">
              <img
                className="rounded-circle img-fluid"
                src="Assets/placeholder.png"
              />
            </div>
          </div>
        ) : ""}

      </div>
    );

  const icon = new DivIcon({
    html: renderToStaticMarkup(divIconElement),
    iconUrl: markerAvatar,
    iconSize: [markerScaled[1], markerScaled[1]],
    iconAnchor: [markerScaled[1] / 2, markerScaled[1] / 2],
    className: "border-none bg-transparent user-select-none",
  });
  return (
    <Marker
      position={markerPosition}
      icon={icon}
      draggable={isDraggable}
      key={`PlayableMarker-${id}-marker`}
      eventHandlers={eventFunctions}
    />
  )
}
