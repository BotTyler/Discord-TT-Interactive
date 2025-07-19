import { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";

/**
 * Component that will display a line on a leaflet map.
 */
export default function Line({ positions, color, removeCallback }: { positions: LatLng[]; color: string; removeCallback: () => void }) {
  const [mColor, setColor] = useState<string>(color);
  useEffect(() => {
    setColor(color);
  }, [color]);
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

  return <Polyline key={`LineColor-${mColor}`} positions={positions} color={mColor} eventHandlers={{ click: handleClick }} />;
}
