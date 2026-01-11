import { UUID } from "crypto";
import { DivIcon, LatLng, LeafletEventHandlerFnMap } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import "./MarkerFormatting.css"
import { renderToStaticMarkup } from "react-dom/server";
import { CharacterStatus } from "../../../shared/StatusTypes";

export default function MarkerDisplay(
  { name,
    size,
    avatarURI,
    position,
    color,
    health,
    totalHealth,
    statuses,
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
      statuses: CharacterStatus[];
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
  const [markerStatuses, setMarkerStatuses] = useState<CharacterStatus[]>(statuses);

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
  }, [position]);
  useEffect(() => {
    setColor(color);
  }, [color]);
  useEffect(() => {
    setMarkerHealth(health);
  }, [health]);
  useEffect(() => {
    setMarkerTotalHealth(totalHealth);
  }, [totalHealth]);
  useEffect(() => {
    setMarkerStatuses(statuses);
  }, [statuses]);

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
            {
              markerStatuses.map((status: CharacterStatus, index: number) => {
                if (index < 5) {
                  return (
                    <div className={`statusImageDiv statusImageDiv${index}`}>
                      <img
                        className="rounded-circle img-fluid"
                        src="Assets/placeholder.png"
                      />
                    </div>
                  );
                } else if (index === 5) {
                  const remaining: number = markerStatuses.length - index;
                  if (remaining === 0) {
                    // This is the last one perfectly fine to render as is.
                    return (
                      <div className={`statusImageDiv statusImageDiv${index}`}>
                        <img
                          className="rounded-circle img-fluid"
                          src="Assets/placeholder.png"
                        />
                      </div>
                    );
                  }
                } else {
                  // This is going to fall under "overflow".
                  return <></>;
                }
              })
            }
            {/* <div className="statusImageDiv statusImageDiv2"> */}
            {/*   <img */}
            {/*     className="rounded-circle img-fluid" */}
            {/*     src="Assets/placeholder.png" */}
            {/*   /> */}
            {/* </div> */}
            {/* <div className="statusImageDiv statusImageDiv3"> */}
            {/*   <img */}
            {/*     className="rounded-circle img-fluid" */}
            {/*     src="Assets/placeholder.png" */}
            {/*   /> */}
            {/* </div> */}
            {/* <div className="statusImageDiv statusImageDiv4"> */}
            {/*   <img */}
            {/*     className="rounded-circle img-fluid" */}
            {/*     src="Assets/placeholder.png" */}
            {/*   /> */}
            {/* </div> */}
            {/* <div className="statusImageDiv statusImageDiv5"> */}
            {/*   <img */}
            {/*     className="rounded-circle img-fluid" */}
            {/*     src="Assets/placeholder.png" */}
            {/*   /> */}
            {/* </div> */}
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
