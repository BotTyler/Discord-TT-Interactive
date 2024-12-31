import { LatLng } from "leaflet";
import { Circle as RLCircle } from "react-leaflet";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { useEffect, useState } from "react";

export default function Circle({ center, radius, color, removeCallback }: { center: LatLng; radius: number; color: string; removeCallback: () => void }) {
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
  return <RLCircle center={center} radius={radius} color={mColor} eventHandlers={{ click: handleClick }} key={`LineColor-${mColor}`}/>;
}
