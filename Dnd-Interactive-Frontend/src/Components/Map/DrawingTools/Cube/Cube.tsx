// method to create a cube on a react-leaflet map
import { LatLng, LatLngBoundsExpression } from "leaflet";
import { Rectangle } from "react-leaflet";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { useEffect, useState } from "react";

// Center refers to the center position and radius is the width / 2.
export default function Cube({ center, radius, color, removeCallback }: { center: LatLng; radius: number; color: string; removeCallback: () => void }) {
  const [mColor, setColor] = useState<string>(color);
  useEffect(() => {
    setColor(color);
  }, [color]);
  function calcLatLng(): LatLngBoundsExpression {
    const tlLat = center.lat - radius;
    const tlLng = center.lng + radius;

    const brLat = center.lat + radius;
    const brLng = center.lng - radius;

    return [
      [tlLat, tlLng],
      [brLat, brLng],
    ];
  }

  const toolContext = useGameToolContext();
  const handleClick = () => {
    switch (toolContext.curTool) {
      case Tools.DELETE:
        removeCallback();
        break;
      default:
        console.log("No Methods found");
    }
  };
  return <Rectangle bounds={calcLatLng()} color={mColor} eventHandlers={{ click: handleClick }} key={`LineColor-${mColor}`} />;
}
