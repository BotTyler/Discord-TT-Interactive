import React from "react";
import { forwardRef, useImperativeHandle } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { usePlayers } from "../PlayersContext/PlayersContext";
export interface MessageInterface {
  userId: string;
  displayName: string;
  message: string;
  created: Date;
  type: string;
}

export const MessageHandler = forwardRef(function MessageHandler({}: {}, ref: any) {
  const [allMessage, setAllMessages] = React.useState<MessageInterface[]>([]);
  const authContext = useAuthenticatedContext();
  const playersContext = usePlayers();
  useImperativeHandle(ref, () => ({
    getAllMessage(): MessageInterface[] {
      return allMessage;
    },
  }));

  React.useEffect(() => {
    const event = new CustomEvent(`MessageAdd`, {
      detail: { val: allMessage },
    });
    window.dispatchEvent(event);
  }, [allMessage]);

  React.useEffect(() => {
    const handleMessageChange = (data: { message: MessageInterface }) => {
      const player = playersContext.getPlayer(authContext.user.id)!;
      if (player.isHost && data.message.type === "player") return; // host should not see player messages
      if (!player.isHost && data.message.type === "host") return; // players should not see host messages
      setAllMessages((prev) => {
        return [...prev, data.message];
      });
    };
    const onPlayerMessageAdd = authContext.room.onMessage("PlayerMessageAdd", handleMessageChange);
    const onHostMessageAdd = authContext.room.onMessage("HostMessageAdd", handleMessageChange);
    const onAllMessageAdd = authContext.room.onMessage("AllMessageAdd", handleMessageChange);

    return () => {
      onPlayerMessageAdd();
      onHostMessageAdd();
      onAllMessageAdd();
    };
  }, [authContext.room]);

  return <></>;
});
