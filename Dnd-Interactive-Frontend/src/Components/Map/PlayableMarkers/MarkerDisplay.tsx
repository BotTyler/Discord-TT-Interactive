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
    className = "",
    statuses,
    isHovering = false,
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
      statuses?: CharacterStatus[];
      isHovering?: boolean;
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
  const [markerStatuses, setMarkerStatuses] = useState<CharacterStatus[]>(statuses ?? []);


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
    setMarkerStatuses(statuses ?? []);
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
          {
            markerHealth <= 0 ?

              <div className={"rounded-circle"} style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                userSelect: "none",
                background: "gray",
                opacity: "40%",
              }}>
                <img
                  className="rounded-circle img-fluid"
                  src={`Assets/Skull_and_crossbones_vector.svg`}
                  draggable="false"
                />
              </div>
              :
              ""
          }
        </div>
        <div
          className="markerNameTagDiv text-center"
        >
          {displayName ?
            (
              <p className="text-nowrap text-capitalize text-break m-0 p-1"
                style={{
                  color: "white",
                  zIndex: 0,
                  fontSize: "1.3em",
                  fontWeight: 900,
                  WebkitTextStroke: "1px black",
                }}>
                {markerName}
              </p>
            )
            : ""
          }
        </div>
        {
          displayName ? (
            <div className="markerStatusBox" key={`DisplayMarker-${id}-${name}`}>
              {
                markerStatuses.map((status: CharacterStatus, index: number) => {
                  if (index < 4) {
                    return (
                      <div className={`statusImageDiv statusImageDiv${index + 1}`} key={`MarkerStatus-${id}-${status.toString()}-${index}`}>
                        <img
                          className="rounded-circle img-fluid"
                          src={`Assets/Conditions/${status.status}.png`}
                        />
                      </div>
                    );
                    // Only 5 can show at a time so this bubble needs to be reactive.
                    // index of 4 as indexes are 0 based.
                  } else if (index === 4) {

                    const remaining: number = markerStatuses.length - index;
                    if (remaining === 1) {
                      // This is the last one perfectly fine to render as is.
                      return (
                        <div className={`statusImageDiv statusImageDiv5`} key={`MarkerStatus-${id}-${status.toString()}-${index}`}>
                          <img
                            className="rounded-circle img-fluid"
                            src={`Assets/Conditions/${status.status}.png`}
                          />
                        </div>
                      );
                    } else {
                      // There are too many to display. lets start the overflow.
                      const remainingList: CharacterStatus[] = markerStatuses.slice(index);
                      return (
                        <div
                          key={`MarkerStatus-${id}-${status}-${index}`}
                        >
                          <div
                            className={`statusImageDiv statusImageDiv5 rounded-circle overflow-hidden d-flex justify-content-center align-items-center`}
                            style={{
                              color: "black",
                              background: "white",
                              border: "2px solid black"
                            }}
                          >
                            <p className="p-0 m-0" style={{
                              fontSize: "1em",
                              fontWeight: 900
                            }}>{remaining}</p>
                          </div>
                          {isHovering ?
                            <div
                              className={`statusOverflowDiv row g-0 rounded`}
                            >
                              {remainingList.map((val: CharacterStatus, overflowIndex: number) => {
                                return (
                                  <div className="col-3" key={`OverflowContainer-${val.toString()}-${overflowIndex}`}>
                                    <img
                                      className="rounded-circle img-fluid"
                                      src={`Assets/Conditions/${val.status}.png`}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                            :
                            ""}
                        </div>
                      );
                    }
                  }
                })
              }
            </div>
          ) : ""
        }

      </div >
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
