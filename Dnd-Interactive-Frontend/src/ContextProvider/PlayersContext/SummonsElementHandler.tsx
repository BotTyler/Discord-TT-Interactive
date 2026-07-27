import React from "react";
import { Summons } from "../../shared/Summons";
import { mLatLng } from "../../shared/PositionInterface";
import { CharacterStatus } from "../../shared/StatusTypes";
import { MARKER_SIZE_CATEGORIES } from "../../shared/MarkerOptions";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { Callbacks } from "@colyseus/schema";

// this class def can be simpler
export default function SummonsElementHandler({ summon }: { summon: Summons; }) {
  const [id, setId] = React.useState<number>(summon.id);
  const [player_id, setPlayerId] = React.useState<string>(summon.player_id);
  const [avatarUri, setAvatarUri] = React.useState<string>(summon.avatarUri);
  const [name, setName] = React.useState<string>(summon.name);
  const [position, setPosition] = React.useState<mLatLng>(summon.position);
  const [toPosition, setToPosition] = React.useState<mLatLng[]>([]);
  const [sizeCategory, setSizeCategory] = React.useState<MARKER_SIZE_CATEGORIES>(summon.size_category);
  const [color, setColor] = React.useState<string>(summon.color);
  const [health, setHealth] = React.useState<number>(summon.health);
  const [totalHealth, setTotalHealth] = React.useState<number>(summon.totalHealth);
  const [lifeSaves, setLifeSaves] = React.useState<number>(summon.lifeSaves);
  const [deathSaves, setDeathSaves] = React.useState<number>(summon.deathSaves);
  const [isVisible, setIsVisible] = React.useState<boolean>(summon.isVisible);
  const [statuses, setStatuses] = React.useState<CharacterStatus[]>(summon.statuses);

  const authContext = useAuthenticatedContext();


  // below effects are used to emit events when the value is finalized
  const emitFieldChangeEvent = (field: string, value: any) => {
    const event = new CustomEvent(`SummonUpdate-${id}-${field}`, {
      detail: { val: value },
    });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    emitFieldChangeEvent("id", id);
  }, [id]);
  React.useEffect(() => {
    emitFieldChangeEvent("player_id", player_id);
  }, [player_id]);
  React.useEffect(() => {
    emitFieldChangeEvent("avatarUri", avatarUri);
  }, [avatarUri]);
  React.useEffect(() => {
    emitFieldChangeEvent("name", name);
  }, [name]);
  React.useEffect(() => {
    emitFieldChangeEvent("position", position);
  }, [position]);
  React.useEffect(() => {
    emitFieldChangeEvent("toPosition", toPosition);
  }, [toPosition]);
  React.useEffect(() => {
    emitFieldChangeEvent("size", sizeCategory);
  }, [sizeCategory]);
  React.useEffect(() => {
    emitFieldChangeEvent("color", color);
  }, [color]);
  React.useEffect(() => {
    emitFieldChangeEvent("health", health);
  }, [health]);
  React.useEffect(() => {
    emitFieldChangeEvent("totalHealth", totalHealth);
  }, [totalHealth]);
  React.useEffect(() => {
    emitFieldChangeEvent("lifeSaves", lifeSaves);
  }, [lifeSaves]);
  React.useEffect(() => {
    emitFieldChangeEvent("deathSaves", deathSaves);
  }, [deathSaves]);
  React.useEffect(() => {
    emitFieldChangeEvent("isVisible", isVisible);
  }, [isVisible]);
  React.useEffect(() => {
    emitFieldChangeEvent("statuses", statuses);
  }, [statuses]);

  React.useEffect(() => {
    if (authContext.room === null) return;
    const roomCallbacks = Callbacks.get(authContext.room);
    console.info("Setting up summons listener", summon);
    // set all listeners with the colyseus backend
    const idListener = roomCallbacks.listen(summon, "id", (value: number) => {
      setId(value);
    });
    const playerIdListener = roomCallbacks.listen(summon, "player_id", (value: string) => {
      setPlayerId(value);
    });
    const avatarUriListener = roomCallbacks.listen(summon, "avatarUri", (value: string) => {
      setAvatarUri(value);
    });
    const nameListener = roomCallbacks.listen(summon, "name", (value: string) => {
      setName(value);
    });
    const positionListener = roomCallbacks.listen(summon, "position", (value: mLatLng) => {
      setPosition(value);
    });
    const toPositionListener = roomCallbacks.listen(summon, "toPosition", (value: mLatLng[]) => {
      setToPosition(value);
    });
    const sizeListener = roomCallbacks.listen(summon, "size_category", (value: MARKER_SIZE_CATEGORIES) => {
      setSizeCategory(value);
    });
    const colorListener = roomCallbacks.listen(summon, "color", (value: string) => {
      setColor(value);
    });
    const healthListener = roomCallbacks.listen(summon, "health", (value: number) => {
      setHealth(value);
    });
    const totalHealthListener = roomCallbacks.listen(summon, "totalHealth", (value: number) => {
      setTotalHealth(value);
    });
    const lifeSavesListener = roomCallbacks.listen(summon, "lifeSaves", (value: number) => {
      setLifeSaves(value);
    });
    const deathSavesListener = roomCallbacks.listen(summon, "deathSaves", (value: number) => {
      setDeathSaves(value);
    });
    const isVisibleListener = roomCallbacks.listen(summon, "isVisible", (value: boolean) => {
      setIsVisible(value);
    });
    const statusesListener = roomCallbacks.listen(summon, "statuses", (value: CharacterStatus[]) => {
      setStatuses([...value]);
    });


    return () => {
      idListener();
      playerIdListener();
      avatarUriListener();
      nameListener();
      positionListener();
      toPositionListener();
      sizeListener();
      colorListener();
      healthListener();
      totalHealthListener();
      lifeSavesListener();
      deathSavesListener();
      isVisibleListener();
      statusesListener();
    };
  }, [summon]);
  return <></>;
}
