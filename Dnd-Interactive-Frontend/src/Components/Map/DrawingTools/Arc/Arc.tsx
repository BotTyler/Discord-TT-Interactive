import { LatLng } from "leaflet";
import { Polygon, useMap } from "react-leaflet";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";
import { useEffect, useState } from "react";

export default function Arc({ center, toLocation, angle, color, removeCallback }: { center: LatLng; toLocation: LatLng; angle: number; color: string; removeCallback: () => void }) {
  const [mColor, setColor] = useState<string>(color);
  useEffect(() => {
    setColor(color);
  }, [color]);
  const map = useMap();
  function calcLatlng(): LatLng[] {
    const T1 = Math.sin(90 * (Math.PI / 180)); // Simplify Use for law of sin
    const T2 = map.distance(center, toLocation) / Math.sin((90 - angle / 2) * (Math.PI / 180)); // law of sin implementation to find the distance to find the length from start to the two new points.

    const T3 = Math.atan2(calcChange(center.lat, toLocation.lat), calcChange(center.lng, toLocation.lng)); // Calculate the angle the mouse makes with the horizontal line of the start. (Unit circle)
    const T4 = (angle / 2) * (Math.PI / 180); // Find half the expected view angle so it can be added and subtracted to find the new points angle with the horizontal. (Unit circle).
    const T5 = T1 * T2; // Reduce repetative calculations.

    // Below are the calculations that are needed to figure out the new points
    const c1x = center.lng + T5 * Math.cos(T3 + T4);
    const c1y = center.lat + T5 * Math.sin(T3 + T4);
    const c1 = new LatLng(c1y, c1x);

    const c2x = center.lng + T5 * Math.cos(T3 - T4);
    const c2y = center.lat + T5 * Math.sin(T3 - T4);
    const c2 = new LatLng(c2y, c2x);
    return [center, c1, c2];
  }
  function calcChange(num1: number, num2: number) {
    return num2 - num1;
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
  return <Polygon positions={calcLatlng()} color={mColor} eventHandlers={{ click: handleClick }} key={`LineColor-${mColor}`} />;
}
