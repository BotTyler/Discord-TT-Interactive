import { DivIcon, LatLng, LeafletEvent, LeafletMouseEvent } from "leaflet";
import React from "react";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";
import DistanceLine from "../Player/DistanceLine";
import '../Player/MarkerFormatting.css';

/**
 * Class that represents an enemy marker on a react leaflet map.
 * this class will be forwardRef since it will need to be used in another component.
 * This component is separate to reduce the amount of components that need to be rerendered.***
 */
export default function EnemyMarker({ name, id, size, playerAvatar, position }: { name: string; id: number; size: number; playerAvatar: string; position: LatLng }) {
  const map = useMap();
  const [rawSize, setRawSize] = React.useState(size);

  const [_name, setName] = React.useState<string>(name);
  const [_size, setSize] = React.useState([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]); // may need to change 0 to be what the current zoom is
  const [_position, setPosition] = React.useState<LatLng>(position);
  const [_avatar, setAvatar] = React.useState<string>(playerAvatar);
  const [isDragging, setDragging] = React.useState<boolean>(false);
  const [toPosition, setTo] = React.useState<LatLng | undefined>(undefined);

  React.useEffect(() => {
    setName(name);
  }, [name]);
  React.useEffect(() => {
    setRawSize(size);
    setSize([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]);
  }, [size]);
  React.useEffect(() => {
    setPosition(position);
  }, [position]);
  React.useEffect(() => {
    setAvatar(playerAvatar);
  }, [playerAvatar]);

  const authContext = useAuthenticatedContext();
  React.useEffect(() => {
    // handler that will rescale the object to the correct size after a zoom animation is finished
    const zoomEnd = () => {
      const zoom = map.getZoom();
      const newSize = _size[1] * map.getZoomScale(zoom, _size[0]);
      setSize([zoom, newSize]);
    };

    map.on("zoomend", zoomEnd);
    return () => {
      map.off("zoomend", zoomEnd);
    };
  }, [map, _size]);
  const svgIcon = new DivIcon({
    html: `
<div class="w-100 h-100 position-relative marker-container">
<img
src="/colyseus/getImage/${_avatar}"
alt="marker-icon"
style="width: 100%; height: 100%; object-fit: cover; border: 3px solid red; "
class="rounded-circle marker-image"
/>
<div class="position-absolute" style="top: 0; left: 0; right: 0; bottom: 0; background: transparent">
</div>
<div class="position-absolute text-center icon-text">
<p class="markerNameTag text-nowrap">
${_name}
</p>
</div>
</div
`,
    iconUrl: _avatar,
    iconSize: [_size[1], _size[1]],
    iconAnchor: [_size[1] / 2, _size[1] / 2],
    className: "border-none bg-transparent user-select-none",
  });
  //toast.addToast("debug", "UPDATE");

  const handleDragStart = (e: LeafletEvent) => {
    setTo(e.target._latlng);
    setDragging(true);
  };

  useMapEvents({
    mousemove: (e: LeafletMouseEvent) => {
      if (!isDragging) return;
      setTo(e.latlng);
    },
    mouseup: (e: LeafletMouseEvent) => {
      if (!isDragging) return;
      setTo(undefined);
      setDragging(false);
      authContext.room.send("updateEnemyPosition", { pos: e.latlng, clientToChange: id + "" });
    },
  });

  return (
    <>
      <Marker
        position={isDragging ? toPosition! : _position}
        icon={svgIcon}
        draggable={true}
        eventHandlers={{
          dragstart: handleDragStart,
        }}
      />
      {toPosition !== undefined ? <DistanceLine start={_position} end={toPosition} size={rawSize} color={"red"} key={`EnemyMovementLineController-${id}`} /> : ""}
    </>
  );
}
