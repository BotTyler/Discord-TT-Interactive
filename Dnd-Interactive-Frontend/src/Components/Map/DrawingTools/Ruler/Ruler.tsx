import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import DistanceLine from "../../PlayableMarkers/DistanceLine";

export default function Ruler({ start, end, playerSize, color }: { start: LatLng; end: LatLng; playerSize: number; color: string; }) {
  const [mColor, setColor] = useState<string>(color);
  useEffect(() => {
    setColor(color);
  }, [color]);

  return <DistanceLine
    start={start}
    end={end}
    size={playerSize}
    color={mColor}
    key={`CurrentCubeCreationDistanceLine`}
  />
}
