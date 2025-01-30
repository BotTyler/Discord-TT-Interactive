import { LeafletEvent, Icon, LatLng, LeafletMouseEvent, DivIcon } from "leaflet";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";
import DistanceLine from "./DistanceLine";
import { useEffect, useState } from "react";

import './MarkerFormatting.css'

/**
 * This forwardRef component is meant to handle the player marker on screen.
 * When a drag is completed the marker should send a message to the server asking for a movement to happen.
 */
export default function PlayerMarker({ name, playerId, size, playerAvatar, position, color }: { name:string, playerId: string; size: number; playerAvatar: string; position: LatLng; color: string }) {
    const map = useMap();
    const [rawSize, setRawSize] = useState(size);
    const [_size, setSize] = useState([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]);
    const [_name, setName] = useState<string>(name);
    const [_avatar, setAvatar] = useState<string>(playerAvatar);
    const [_position, setPosition] = useState<LatLng>(position);
    const [isDragging, setDragging] = useState<boolean>(false);
    const [toPosition, setTo] = useState<LatLng | undefined>(undefined);
    const [_color, setColor] = useState<string>(color);

    useEffect(() => {
        setName(name);
    }, [name]);
    useEffect(() => {
        setPosition(position);
    }, [position]);
    useEffect(() => {
        setColor(color);
    }, [color]);
    useEffect(() => {
        setAvatar(playerAvatar);
    }, [playerAvatar]);
    useEffect(() => {
        setRawSize(size);
        setSize([map.getZoom(), size * map.getZoomScale(map.getZoom(), 0)]);
    }, [size]);

    const authContext = useAuthenticatedContext();
    useEffect(() => {
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

    const handleDragStart = (e: LeafletEvent) => {
        setTo(e.target._latlng);
        setDragging(true);
    };
    /*const icon = new Icon({
    iconUrl: _avatar,
    iconSize: [_size[1], _size[1]],
    iconAnchor: [_size[1] / 2, _size[1] / 2],
    className: "rounded-circle",
  });
*/
    const icon = new DivIcon({
        html: `
<div class="w-100 h-100 position-relative">
<img
src="${_avatar}"
alt="marker-icon"
style="width: 100%; height: 100%; object-fit: cover; border: 3px solid ${_color}; "
class="rounded-circle "
/>
<div class="position-absolute" style="top: 0; left: 0; right: 0; bottom: 0; background: transparent">
</div>
<div class="position-absolute text-center icon-text">
<p class="w-100 h-auto">
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
    useMapEvents({
        mousemove: (e: LeafletMouseEvent) => {
            if (!isDragging) return;
            setTo(e.latlng);
        },
        mouseup: (e: LeafletMouseEvent) => {
            if (!isDragging) return;
            setTo(undefined);
            setDragging(false);
            authContext.room.send("updatePosition", { pos: e.latlng, clientToChange: playerId });
        },
    });
    return (
        <>
            <Marker
                position={isDragging ? toPosition! : _position}
                icon={icon}
                draggable={true}
                eventHandlers={{
                    // mouseup: handleMouseUp,
                    dragstart: handleDragStart,
                }}
                key={`PlayerController-${playerId}-marker`}
            />
            {toPosition !== undefined ? <DistanceLine start={_position} end={toPosition} size={rawSize} color={"red"} key={`MovementLineController-${playerId}`} /> : ""}
            <div>
                {_name}
            </div>
        </>
    );
}
