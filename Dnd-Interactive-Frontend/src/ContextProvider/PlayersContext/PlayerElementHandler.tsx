import { ArcDrawing, BeamDrawing, CircleDrawing, CubeDrawing } from "../../../src/shared/DrawingInterface";
import { mLatLng } from "../../../src/shared/PositionInterface";
import { Player } from "../../../src/shared/Player";
import React from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { Summons } from "../../shared/Summons";
import SummonsElementHandler from "./SummonsElementHandler";
import { CharacterStatus } from "../../shared/StatusTypes";

// this class def can be simpler
export default function PlayerElementHandler({ player, onValueChanged }: { player: Player; onValueChanged: (field: string, value: unknown) => void }) {
  const [userId, setUserId] = React.useState<string>(player.userId);
  const [avatar, setAvatar] = React.useState<string>(player.avatarUri);
  const [name, setName] = React.useState<string>(player.name);
  const [sessionId, setSessionId] = React.useState<string>(player.sessionId);
  const [isHost, setIsHost] = React.useState<boolean>(player.isHost);
  const [color, setColor] = React.useState<string>(player.color);
  const [initiative, setInitiative] = React.useState<number>(player.initiative);
  const [position, setPosition] = React.useState<mLatLng>(player.position);
  const [toPosition, setToPosition] = React.useState<mLatLng[]>([]);
  const [health, setHealth] = React.useState<number>(player.health);
  const [totalHealth, setTotalHealth] = React.useState<number>(player.totalHealth);
  const [deathSaves, setDeathSaves] = React.useState<number>(player.deathSaves);
  const [lifeSaves, setLifeSaves] = React.useState<number>(player.lifeSaves);
  const [drawings, setDrawings] = React.useState<mLatLng[]>(player.drawings);
  const [cubeDrawings, setCubeDrawings] = React.useState<CubeDrawing | null>(player.cubeDrawing);
  const [circleDrawings, setCircleDrawings] = React.useState<CircleDrawing | null>(player.circleDrawing);
  const [arcDrawings, setArcDrawings] = React.useState<ArcDrawing | null>(player.arcDrawing);
  const [beamDrawing, setBeamDrawing] = React.useState<BeamDrawing | null>(player.beamDrawing);
  const [isConnected, setConnected] = React.useState<boolean>(player.isConnected);
  const [statuses, setStatuses] = React.useState<CharacterStatus[]>(player.statuses);

  const [summons, setSummons] = React.useState<Summons[]>(player.summons);
  const [connectedSummons, setConnectedSummons] = React.useState<Summons[]>(player.summons);

  const authContext = useAuthenticatedContext();

  // below effects are used to emit events when the value is finalized
  const emitFieldChangeEvent = (field: string, value: any) => {
    onValueChanged(field, value);
    const event = new CustomEvent(`update-${userId}-${field}`, {
      detail: { val: value },
    });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    emitFieldChangeEvent("userId", userId);
  }, [userId]);
  React.useEffect(() => {
    emitFieldChangeEvent("avatarUri", avatar);
  }, [avatar]);
  React.useEffect(() => {
    emitFieldChangeEvent("name", name);
  }, [name]);
  React.useEffect(() => {
    emitFieldChangeEvent("sessionId", sessionId);
  }, [sessionId]);
  React.useEffect(() => {
    emitFieldChangeEvent("isHost", isHost);
  }, [isHost]);
  React.useEffect(() => {
    emitFieldChangeEvent("color", color);
  }, [color]);
  React.useEffect(() => {
    // 2 events need to be fired so that the initiative list handler can update
    const event = new CustomEvent(`PlayersInitiativeChange`, {
      detail: { val: `PlayersChanged` },
    });
    window.dispatchEvent(event);
    emitFieldChangeEvent("initiative", initiative);
  }, [initiative]);
  React.useEffect(() => {
    emitFieldChangeEvent("position", position);
  }, [position]);
  React.useEffect(() => {
    emitFieldChangeEvent("toPosition", toPosition);
  }, [toPosition]);
  React.useEffect(() => {
    emitFieldChangeEvent("drawings", drawings);
  }, [drawings]);
  React.useEffect(() => {
    emitFieldChangeEvent("cubeDrawing", cubeDrawings);
  }, [cubeDrawings]);
  React.useEffect(() => {
    emitFieldChangeEvent("circleDrawing", circleDrawings);
  }, [circleDrawings]);
  React.useEffect(() => {
    emitFieldChangeEvent("arcDrawing", arcDrawings);
  }, [arcDrawings]);
  React.useEffect(() => {
    emitFieldChangeEvent("beamDrawing", beamDrawing);
  }, [beamDrawing]);
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
    emitFieldChangeEvent("isConnected", isConnected);
  }, [isConnected]);
  React.useEffect(() => {
    emitFieldChangeEvent("statuses", statuses);
  }, [statuses]);
  React.useEffect(() => {
    emitFieldChangeEvent("summons", summons);
  }, [summons]);

  React.useEffect(() => {
    // set all listeners with the colyseus backend
    const userIdListener = player.listen("userId", (value: string) => {
      setUserId(value);
    });
    const avatarListener = player.listen("avatarUri", (value: string) => {
      setAvatar(value);
    });
    const nameListener = player.listen("name", (value: string) => {
      setName(value);
    });
    const sessionIdListener = player.listen("sessionId", (value: string) => {
      setSessionId(value);
    });
    const isHostListener = player.listen("isHost", (value: boolean) => {
      setIsHost(value);
    });
    const colorListener = player.listen("color", (value: string) => {
      setColor(value);
    });
    const initiativeListener = player.listen("initiative", (value: number) => {
      setInitiative(value);
    });
    const positionListener = player.listen("position", (value: mLatLng) => {
      setPosition(value);
    });
    const toPositionListener = player.listen("toPosition", (value: mLatLng[]) => {
      setToPosition(value);
    });
    const healthListener = player.listen("health", (value: number) => {
      setHealth(value);
    });
    const totalHealthListener = player.listen("totalHealth", (value: number) => {
      setTotalHealth(value);
    });
    const deathSavesListener = player.listen("deathSaves", (value: number) => {
      setDeathSaves(value);
    });
    const lifeSavesListener = player.listen("lifeSaves", (value: number) => {
      setLifeSaves(value);
    });
    const drawingsListener = player.listen("drawings", (value: mLatLng[]) => {
      setDrawings(value);
    });
    const cubeDrawingListener = player.listen("cubeDrawing", (value: CubeDrawing | null) => {
      setCubeDrawings(value ?? null);
    });
    const circleDrawingListener = player.listen("circleDrawing", (value: CircleDrawing | null) => {
      setCircleDrawings(value ?? null);
    });
    const arcDrawingListener = player.listen("arcDrawing", (value: ArcDrawing | null) => {
      setArcDrawings(value ?? null);
    });
    const beamDrawingListener = player.listen("beamDrawing", (value: BeamDrawing | null) => {
      setBeamDrawing(value ?? null);
    });
    const connectionListener = player.listen("isConnected", (value: boolean) => {
      setConnected(value);
    });
    const statusesListener = player.listen("statuses", (value: CharacterStatus[]) => {
      setStatuses(value);
    });
    const summonsListener = player.listen("summons", (value: Summons[]) => {
      setSummons([...value]);
      setConnectedSummons([...value]);
    });


    return () => {
      userIdListener();
      avatarListener();
      nameListener();
      sessionIdListener();
      isHostListener();
      colorListener();
      initiativeListener();
      positionListener();
      toPositionListener();
      healthListener();
      totalHealthListener();
      deathSavesListener();
      lifeSavesListener();
      drawingsListener();
      cubeDrawingListener();
      circleDrawingListener();
      arcDrawingListener();
      beamDrawingListener();
      connectionListener();
      statusesListener();
      summonsListener();
    };
  }, [authContext.room, player]);
  return <>
    {connectedSummons.map((item: Summons) => {
      return <SummonsElementHandler summon={item} key={`Player-${userId}-Summon-${item.id}`} onValueChanged={(field: string, value: unknown): void => {
        setSummons((prev: Summons[]): Summons[] => {
          const summonsUpdate: Summons[] = prev.map((val: Summons): Summons => {
            if (val.id !== item.id) return val;

            // Note: this is bad.
            const _summons: any = { ...val };
            _summons[field] = value;
            return _summons;
          })

          return summonsUpdate;
        })
      }} />
    })}
  </>;
}
