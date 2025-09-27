import { UUID } from "crypto";
import { DivIcon, LatLng, LeafletEventHandlerFnMap } from "leaflet";
import { useEffect, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import "./MarkerFormatting.css"

export default function MarkerDisplay(
  { name, size, avatarURI, position, color, className = "", isDraggable = false, displayName = true, eventFunctions }:
  {
      name: string; size: number; avatarURI: string; position: LatLng; color: string; className: string; isDraggable?: boolean; displayName?: boolean;
      eventFunctions?: LeafletEventHandlerFnMap
  }) {

    const map = useMap();

    const [markerName, setName] = useState<string>(name);
    const [makerSize, setSize] = useState<number>(size);
    const [markerScaled, setScaled] = useState([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]);
    const [markerAvatar, setAvatar] = useState<string>(avatarURI);
    const [markerPosition, setPosition] = useState<LatLng>(position);
    const [markerColor, setColor] = useState<string>(color);
    const [id, setId] = useState<UUID>(crypto.randomUUID());

    useEffect(()=>{
      setName(name);
    }, [name])
    useEffect(()=>{
      setSize(size);
      setScaled([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]);
    }, [size])
    useEffect(()=>{
      setAvatar(avatarURI);
    }, [avatarURI]);
    useEffect(()=>{
      setPosition(position);
    }, [position])
    useEffect(()=>{
      setColor(color);
    }, [color])

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
const icon = new DivIcon({
    html: `
<div class="w-100 h-100 position-relative marker-container">
<img
src="${markerAvatar}"
alt="marker-icon"
style="width: 100%; height: 100%; object-fit: cover; border: 3px solid ${markerColor};"
class="rounded-circle ${className}"
/>
<div class="position-absolute" style="top: 0; left: 0; right: 0; bottom: 0; background: transparent">
</div>
<div class="position-absolute text-center icon-text">
${displayName? 
`<p class="markerNameTag text-nowrap">
${markerName}
</p>`:""
}
</div>
</div
`,
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
