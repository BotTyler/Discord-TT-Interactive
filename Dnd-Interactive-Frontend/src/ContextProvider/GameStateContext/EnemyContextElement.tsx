import { Enemy } from "../../../src/shared/Enemy"
import { mLatLng } from "../../../src/shared/PositionInterface"
import React from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { CharacterStatus } from "../../shared/StatusTypes";
import { MARKER_SIZE_CATEGORIES } from "../../shared/MarkerOptions";
import { Callbacks } from "@colyseus/schema";

export default function EnemyContextElement({ enemy, onValueChanged }: { enemy: Enemy; onValueChanged: (field: string, value: unknown) => void }) {
  const [id, setId] = React.useState<number>(enemy.id);
  const [avatarUri, setAvatarUri] = React.useState<string>(enemy.avatarUri);
  const [name, setName] = React.useState<string>(enemy.name);
  const [sizeCategory, setSizeCategory] = React.useState<MARKER_SIZE_CATEGORIES>(enemy.size_category);
  const [position, setPosition] = React.useState<mLatLng>(enemy.position);
  const [toPosition, setToPosition] = React.useState<mLatLng[]>([]);
  const [health, setHealth] = React.useState<number>(enemy.health);
  const [totalHealth, setTotalHealth] = React.useState<number>(enemy.totalHealth);
  const [deathSaves, setDeathSaves] = React.useState<number>(enemy.deathSaves);
  const [lifeSaves, setLifeSaves] = React.useState<number>(enemy.lifeSaves);
  const [initiative, setInitiative] = React.useState<number>(enemy.initiative);
  const [isVisible, setVisible] = React.useState<boolean>(enemy.isVisible);
  const [statuses, setStatuses] = React.useState<CharacterStatus[]>(enemy.statuses);

  const authContext = useAuthenticatedContext();
  const emitFieldChangeEvent = (field: string, value: any) => {
    onValueChanged(field, value);
    const event = new CustomEvent(`EnemyUpdate-${id}-${field}`, {
      detail: { val: value },
    });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    emitFieldChangeEvent("id", id);
  }, [id]);
  React.useEffect(() => {
    emitFieldChangeEvent("avatarUri", avatarUri);
  }, [avatarUri]);
  React.useEffect(() => {
    emitFieldChangeEvent("name", name);
  }, [name]);
  React.useEffect(() => {
    emitFieldChangeEvent("size", sizeCategory);
  }, [sizeCategory]);
  React.useEffect(() => {
    emitFieldChangeEvent("position", position);
  }, [position]);
  React.useEffect(() => {
    emitFieldChangeEvent("toPosition", toPosition);
  }, [toPosition]);
  React.useEffect(() => {
    emitFieldChangeEvent("health", health);
  }, [health]);
  React.useEffect(() => {
    emitFieldChangeEvent("totalHealth", totalHealth);
  }, [totalHealth]);
  React.useEffect(() => {
    emitFieldChangeEvent("deathSaves", deathSaves);
  }, [deathSaves]);
  React.useEffect(() => {
    emitFieldChangeEvent("lifeSaves", lifeSaves);
  }, [lifeSaves]);
  React.useEffect(() => {
    const event = new CustomEvent(`EnemiesVisibilityChange`, {
      detail: { val: `EnemiesVisibilityChange` },
    });
    window.dispatchEvent(event);
    emitFieldChangeEvent("isVisible", isVisible);
  }, [isVisible]);
  React.useEffect(() => {
    // 2 events need to be provided for the initiative list
    const event = new CustomEvent(`EnemiesInitiativeChange`, {
      detail: { val: `EnemiesChanged` },
    });
    window.dispatchEvent(event);
    emitFieldChangeEvent("initiative", initiative);
  }, [initiative]);
  React.useEffect(() => {
    emitFieldChangeEvent("statuses", statuses);
  }, [statuses]);

  React.useEffect(() => {
    if (authContext.room === null) return;
    const roomCallback = Callbacks.get(authContext.room);

    // set the listeners to sync with the server
    const idListener = roomCallback.listen(enemy, "id", (value: number) => {
      setId(value);
    });
    const avatarListener = roomCallback.listen(enemy, "avatarUri", (value: string) => {
      setAvatarUri(value);
    });
    const nameListener = roomCallback.listen(enemy, "name", (value: string) => {
      setName(value);
    });
    const sizeListener = roomCallback.listen(enemy, "size_category", (value: MARKER_SIZE_CATEGORIES) => {
      setSizeCategory(value);
    });
    const positionListener = roomCallback.listen(enemy, "position", (value: mLatLng) => {
      setPosition(value);
    });
    const toPositionListener = roomCallback.listen(enemy, "toPosition", (value: mLatLng[]) => {
      setToPosition(value);
    });
    const healthListener = roomCallback.listen(enemy, "health", (value: number) => {
      setHealth(value);
    });
    const totalHealthListener = roomCallback.listen(enemy, "totalHealth", (value: number) => {
      setTotalHealth(value);
    });
    const deathSavesListener = roomCallback.listen(enemy, "deathSaves", (value: number) => {
      setDeathSaves(value);
    });
    const lifeSavesListener = roomCallback.listen(enemy, "lifeSaves", (value: number) => {
      setLifeSaves(value);
    });
    const initiativeListener = roomCallback.listen(enemy, "initiative", (value: number) => {
      setInitiative(value);
    });
    const isVisibleListener = roomCallback.listen(enemy, "isVisible", (value: boolean): void => {
      setVisible(value);
    });
    const statusesListener = roomCallback.listen(enemy, "statuses", (value: CharacterStatus[]): void => {
      setStatuses([...value]);
    });

    return () => {
      idListener();
      avatarListener();
      nameListener();
      sizeListener();
      positionListener();
      toPositionListener();
      healthListener();
      totalHealthListener();
      deathSavesListener();
      lifeSavesListener();
      initiativeListener();
      isVisibleListener();
      statusesListener();
    };
  }, [authContext.room, enemy]);

  return <></>;
}
