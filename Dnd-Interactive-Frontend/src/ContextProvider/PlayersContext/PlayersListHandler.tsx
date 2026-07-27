import { Player } from "../../../src/shared/Player"
import React, { useImperativeHandle } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import PlayerElementHandler from "./PlayerElementHandler";
import { Callbacks } from "@colyseus/schema";

export const PlayersListHandler = React.forwardRef(function PlayersListHandler(_params: any, ref: any) {
  const [players, setPlayers] = React.useState<{ [key: string]: Player }>({});
  const [connectedPlayers, setConnectedPlayers] = React.useState<{ [key: string]: string }>({});
  const authenticatedContext = useAuthenticatedContext();

  useImperativeHandle(
    ref,
    () => ({
      getPlayers() {
        return players;
      },
      getPlayer(id: string) {
        return players[id];
      },
    }),
    [players]
  );

  React.useEffect(() => {
    const event = new CustomEvent(`PlayersChanged`, {
      detail: { val: players },
    });
    window.dispatchEvent(event);
  }, [connectedPlayers]);

  React.useEffect(() => {
    if (authenticatedContext.room === null) {
      console.warn("Room is null");
      return;
    }
    const roomCallback = Callbacks.get(authenticatedContext.room);
    const playerAdd = roomCallback.onAdd("players", (player: any, _key: any) => {
      console.info("Adding Player", player)
      setPlayers((players) => ({ ...players, [player.userId]: player }));
      setConnectedPlayers((prev) => {
        return { ...prev, [player.userId]: player.userId };
      });
    });

    const playerRemove = roomCallback.onRemove("players", (player: any, _key: any) => {
      console.info("Removing Player", player);
      setPlayers((players) => {
        const { [player.userId]: _, ...temp } = players;
        return temp;
      });
      setConnectedPlayers((prev) => {
        const { [player.userId]: _, ...temp } = prev;
        return temp;
      });
    });

    return () => {
      playerAdd();
      playerRemove();
    };
  }, [authenticatedContext.room]);
  return (
    <>
      {Object.keys(connectedPlayers).map((key) => {
        return (
          <PlayerElementHandler
            key={`PlayerContextListElement-${key}`}
            player={players[key]}
            onValueChanged={(field: string, value: unknown) => {
              setPlayers((players) => {
                const newPlayers = { ...players };
                if (newPlayers[key]) {
                  // @ts-expect-error Ignore issue
                  newPlayers[key][field] = value;
                }

                return newPlayers;
              });
            }}
          />
        );
      })}
    </>
  );
});
