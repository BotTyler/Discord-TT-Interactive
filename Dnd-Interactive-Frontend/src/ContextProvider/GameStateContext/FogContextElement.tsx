import { MapFogPolygon } from "../../../shared/src/Map"
import { mLatLng } from "../../../shared/src/PositionInterface"
import React from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";

export default function FogContextElement({ fog, onValueChanged }: { fog: MapFogPolygon; onValueChanged: (field: string, value: unknown) => void }) {
  const [id, setId] = React.useState<number>(fog.id);
  const [points, setPoints] = React.useState<mLatLng[]>(fog.points);
  const [isVisible, setVisible] = React.useState<boolean>(fog.isVisible);

  const authContext = useAuthenticatedContext();

  const emitFieldChangeEvent = (field: string, value: any) => {
    // console.log(`Fog Updating: "FogUpdate-${id}-${field}": ${value}`);

    onValueChanged(field, value);
    const event = new CustomEvent(`FogUpdate-${id}-${field}`, {
      detail: { val: value },
    });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    emitFieldChangeEvent("id", id);
  }, [id]);
  React.useEffect(() => {
    emitFieldChangeEvent("points", points);
  }, [points]);
  React.useEffect(() => {
    emitFieldChangeEvent("isVisible", isVisible);
  }, [isVisible]);

  React.useEffect(() => {
    // set the listeners to sync with the server
    const idListener = fog.listen("id", (value) => {
      setId(value);
    });
    const pointsListener = fog.listen("points", (value) => {
      setPoints(value);
    });
    const visibilityListener = fog.listen("isVisible", (value) => {
      setVisible(value);
    });

    return () => {
      idListener();
      pointsListener();
      visibilityListener();
    };
  }, [authContext.room, fog]);

  return <></>;
}
