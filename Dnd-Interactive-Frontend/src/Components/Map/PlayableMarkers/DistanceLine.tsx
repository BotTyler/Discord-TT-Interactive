import { latLng, LatLng } from "leaflet";
import { useCallback, useEffect, useId, useState } from "react";
import { Polyline, Tooltip, useMap } from "react-leaflet";
/**
 * Component that will handle the distance measurement when a player is being dragged. The distance is based on the cell size of an image that is determined when a map upload happens.
 */
export default function DistanceLine({ start, end, size, color, showDistance = true }: { start: LatLng; end: LatLng; size: number; color: string; showDistance?: boolean }) {
  const [_color, setColor] = useState<string>(color);
  useEffect(() => {
    setColor(color)
  }, [color])

  const map = useMap();
  const [dist, setDist] = useState<number>((map.distance(start, end) / size) * 5);
  useEffect(() => {
    setDist((map.distance(start, end) / size) * 5);
  }, [start, end]);

  const calcMidpoint = useCallback((p1: LatLng, p2: LatLng) => {
    const latMid = p1.lat + (p2.lat - p1.lat) / 2;
    const lonMid = p1.lng + (p2.lng - p1.lng) / 2;

    return latLng(latMid, lonMid);
  }, []);
  return (
    <>
      {start !== undefined && end !== undefined && dist >= 0.1 ? (
        <Polyline positions={[start, end]} color={_color}>
          {showDistance === false || dist < 1 ? (
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

export function DistanceLineGrid({ positions, color, playerSize }: { positions: LatLng[]; color: string; playerSize: number }) {
  const calcDistance = useCallback((): number => {
    // -1 to account for the current position.
    return (positions.length - 1) * 5;
  }, [positions]);

  const id = useId();

  const generatePointPairs = useCallback((): { p1: LatLng, p2: LatLng }[] => {
    const result: { p1: LatLng, p2: LatLng }[] = [];
    let push: LatLng[] = [];

    positions.forEach((val: LatLng): void => {
      push.push(val);
      if (push.length === 2) {
        result.push({ p1: push[0], p2: push[1] });
        push = [push[1]];
      }
    })
    return result;
  }, [positions]);

  const [pairs, setPairs] = useState<{ p1: LatLng, p2: LatLng }[]>(generatePointPairs());
  const [dist, setDist] = useState<number>(calcDistance());

  useEffect(() => {
    setPairs(generatePointPairs());
    setDist(calcDistance());
  }, [positions]);


  return (
    <>
      {pairs.map((val: { p1: LatLng, p2: LatLng }, index: number) => {

        return (
          <Polyline positions={[val.p1, val.p2]} color={color} key={`${id}-DistantGridLine-${index}`}>
            {pairs.length > 0 && index === pairs.length - 1 ? (
              <Tooltip direction="top" position={val.p2} offset={[0, -playerSize / 2]} opacity={1} permanent>
                <p className="p-0 m-0 g-0 fs-5">{Math.round(dist)} ft</p>
              </Tooltip>
            ) : (
              ""
            )}
          </Polyline>
        )
      })}
    </>
  );
}
