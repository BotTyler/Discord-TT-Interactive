import { Enemy } from "../../../shared/src/Enemy"
import { mLatLng } from "../../../shared/src/PositionInterface"
import React from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";

export default function EnemyContextElement({ enemy, onValueChanged }: { enemy: Enemy; onValueChanged: (field: string, value: unknown) => void }) {
  const [id, setId] = React.useState<number>(enemy.id);
  const [avatarUri, setAvatarUri] = React.useState<string>(enemy.avatarUri);
  const [name, setName] = React.useState<string>(enemy.name);
  const [size, setSize] = React.useState<number>(enemy.size);
  const [position, setPosition] = React.useState<mLatLng>(enemy.position);
  const [health, setHealth] = React.useState<number>(enemy.health);
  const [totalHealth, setTotalHealth] = React.useState<number>(enemy.totalHealth);
  const [deathSaves, setDeathSaves] = React.useState<number>(enemy.deathSaves);
  const [lifeSaves, setLifeSaves] = React.useState<number>(enemy.lifeSaves);
  const [initiative, setInitiative] = React.useState<number>(enemy.initiative);

  const authContext = useAuthenticatedContext();
  const emitFieldChangeEvent = (field: string, value: any) => {
    // console.log(`Enemy Updating: "EnemyUpdate-${id}-${field}": ${value}`);
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
    emitFieldChangeEvent("size", size);
  }, [size]);
  React.useEffect(() => {
    emitFieldChangeEvent("position", position);
  }, [position]);
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
    // 2 events need to be provided for the initiative list
    const event = new CustomEvent(`EnemiesInitiativeChange`, {
      detail: { val: `EnemiesChanged` },
    });
    window.dispatchEvent(event);
    emitFieldChangeEvent("initiative", initiative);
  }, [initiative]);

  React.useEffect(() => {
    // set the listeners to sync with the server
    const idListener = enemy.listen("id", (value: number) => {
      setId(value);
    });
    const avatarListener = enemy.listen("avatarUri", (value: string) => {
      setAvatarUri(value);
    });
    const nameListener = enemy.listen("name", (value: string) => {
      setName(value);
    });
    const sizeListener = enemy.listen("size", (value: number) => {
      setSize(value);
    });
    const positionListener = enemy.listen("position", (value: mLatLng) => {
      setPosition(value);
    });
    const healthListener = enemy.listen("health", (value: number) => {
      setHealth(value);
    });
    const totalHealthListener = enemy.listen("totalHealth", (value: number) => {
      setTotalHealth(value);
    });
    const deathSavesListener = enemy.listen("deathSaves", (value: number) => {
      setDeathSaves(value);
    });
    const lifeSavesListener = enemy.listen("lifeSaves", (value: number) => {
      setLifeSaves(value);
    });
    const initiativeListener = enemy.listen("initiative", (value: number) => {
      setInitiative(value);
    });

    return () => {
      idListener();
      avatarListener();
      nameListener();
      sizeListener();
      positionListener();
      healthListener();
      totalHealthListener();
      deathSavesListener();
      lifeSavesListener();
      initiativeListener();
    };
  }, [authContext.room, enemy]);

  return <></>;
}
