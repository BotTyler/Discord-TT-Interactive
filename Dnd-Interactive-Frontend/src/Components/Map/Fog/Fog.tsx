import { mLatLng } from "../../../../shared/src/PositionInterface";
import L from "leaflet";
import React from "react";
import { Polygon } from "react-leaflet";
import { Tools, useGameToolContext } from "../../../ContextProvider/GameToolProvider";

/**
 * This class is responsible for rendering a polygon on screen that will represent fog in the game.
 */
export default function Fog({ _points, _isVisible, removeCallback, visibilityCallback, color, fillColor, id }: { _points: mLatLng[]; _isVisible: boolean; color: string; fillColor: string; removeCallback?: (obj: string) => void; visibilityCallback?: (obj: string, val: boolean) => void; id?: string }) {
  const toolContext = useGameToolContext();
  const [points, setPoints] = React.useState<mLatLng[]>(_points);
  const [isVisible, setVisible] = React.useState<boolean>(_isVisible);
  React.useEffect(() => {
    setPoints(_points);
  }, [_points]);
  React.useEffect(() => {
    setVisible(_isVisible);
  }, [_isVisible]);

  const handleClick = () => {
    if (id == undefined) return;
    if (removeCallback == undefined) return;
    if (visibilityCallback == undefined) return;
    switch (toolContext.curTool) {
      case Tools.DELETE:
        removeCallback(id);
        break;
      case Tools.VISIBILITY:
        visibilityCallback(id, !isVisible);
        break;
      default:
        console.log("NO TOOL CALL NEEDED");
    }
  };

  React.useEffect(() => {
    if (id == undefined) return;
    // this is a value that is stored on the server (id is set), we need to add listeners to note any changes
    const handlePointsChange = (value: any) => {
      setPoints(value.detail.val);
    };
    const handleVisibilityChange = (value: any) => {
      setVisible(value.detail.val);
    };

    window.addEventListener(`FogUpdate-${id}-points`, handlePointsChange);
    window.addEventListener(`FogUpdate-${id}-isVisible`, handleVisibilityChange);
    return () => {
      window.removeEventListener(`FogUpdate-${id}-points`, handlePointsChange);
      window.removeEventListener(`FogUpdate-${id}-isVisible`, handleVisibilityChange);
    };
  }, []);

  return (
    <Polygon
      positions={points.map((point) => {
        return L.latLng(point.lat, point.lng);
      })}
      eventHandlers={{
        click: handleClick,
      }}
      fillOpacity={+!isVisible}
      fillColor={fillColor}
      color={color}
      key={`${isVisible}`}
    />
  );
}
