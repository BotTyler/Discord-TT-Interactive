import { LatLng, LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";
import { Polygon, Rectangle } from "react-leaflet";
import { Tools, useGameToolContext } from "../../../../ContextProvider/GameToolProvider";

export default function Beam({ start, end, width, playerSize, color, removeCallback }: { start: LatLng; end: LatLng; width: number; playerSize: number; color: string; removeCallback: () => void }) {
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

  function calcLatLng(): LatLng[] {
    // Each square is 5 ft, convert for a multipler of player_size.
    const widthMult: number = width / 5;

    const angle: number = Math.atan2(calcChange(end.lat, start.lat), calcChange(end.lng, start.lng));
    const half_width: number = playerSize * (widthMult / 2);

    const inv_angle: number = (Math.PI / 2) - angle;

    const delta_x: number = half_width * Math.cos(inv_angle);
    const delta_y: number = half_width * Math.sin(inv_angle);

    const p1_x_l = start.lng - delta_x;
    const p1_y_l = start.lat + delta_y;
    const p1_l = new LatLng(p1_y_l, p1_x_l);

    const p1_x_r = start.lng + delta_x;
    const p1_y_r = start.lat - delta_y;
    const p1_r = new LatLng(p1_y_r, p1_x_r);

    const p2_x_l = end.lng - delta_x;
    const p2_y_l = end.lat + delta_y;
    const p2_l = new LatLng(p2_y_l, p2_x_l);

    const p2_x_r = end.lng + delta_x;
    const p2_y_r = end.lat - delta_y;
    const p2_r = new LatLng(p2_y_r, p2_x_r);

    return [p1_l, p1_r, p2_r, p2_l];
  }

  function calcChange(num1: number, num2: number) {
    return num2 - num1;
  }

  // return <Rectangle bounds={calcLatLng()} color={mColor} eventHandlers={{ click: handleClick }} key={`LineColor-${mColor}`} />;
  return <Polygon positions={calcLatLng()} color={mColor} eventHandlers={{ click: handleClick }} key={`LineColor-${mColor}`} />;
}
