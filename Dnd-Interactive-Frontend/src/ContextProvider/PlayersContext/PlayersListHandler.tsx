import { Player } from "../../../src/shared/Player"
import React, { useImperativeHandle } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import PlayerElementHandler from "./PlayerElementHandler";

export const PlayersListHandler = React.forwardRef(function PlayersListHandler({ }: {}, ref: any) {
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
    try {
      const playerAdd = authenticatedContext.room.state.players.onAdd((player: any, _key: any) => {
        setPlayers((players) => ({ ...players, [player.userId]: player }));
        setConnectedPlayers((prev) => {
          return { ...prev, [player.userId]: player.userId };
        });
      });

      const playerRemove = authenticatedContext.room.state.players.onRemove((player: any, _key: any) => {
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
    } catch (e) {
      console.error("Couldn't connect:", e);
    }
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
                  // @ts-expect-error
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
