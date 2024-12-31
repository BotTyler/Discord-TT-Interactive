import { latLng, LatLng, LeafletMouseEvent } from "leaflet";
import React, { useEffect } from "react";
import { Polyline, Tooltip, useMap, useMapEvents } from "react-leaflet";
/**
 * Component that will handle the distance measurement when a player is being dragged. The distance is based on the cell size of an image that is determined when a map upload happens.
 */
export default function DistanceLine({ start, end, size, color }: { start: LatLng; end: LatLng; size: number; color: string }) {
  const map = useMap();
  const [dist, setDist] = React.useState<number>((map.distance(start, end) / size) * 5);
  useEffect(() => {
    setDist((map.distance(start, end) / size) * 5);
  }, [start, end]);

  const calcMidpoint = React.useCallback((p1: LatLng, p2: LatLng) => {
    const latMid = p1.lat + (p2.lat - p1.lat) / 2;
    const lonMid = p1.lng + (p2.lng - p1.lng) / 2;

    return latLng(latMid, lonMid);
  }, []);
  return (
    <>
      {start !== undefined && end !== undefined ? (
        <Polyline positions={[start, end]} color={color}>
          {dist < 1 ? (
            ""
          ) : (
            <Tooltip direction="auto" position={calcMidpoint(start, end)} offset={[0, 40]} opacity={1} permanent>
              <p className="p-0 m-0 g-0 fs-5">{Math.round(dist)} ft</p>
            </Tooltip>
          )}
        </Polyline>
      ) : (
        ""
      )}
    </>
  );
}
