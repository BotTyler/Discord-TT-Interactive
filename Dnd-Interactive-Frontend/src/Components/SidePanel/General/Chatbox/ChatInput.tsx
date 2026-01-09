import React from "react";
import { useMessageContext } from "../../../../ContextProvider/Messages/MessageContextProvider";
import { usePlayers } from "../../../../ContextProvider/PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";

export default function ChatInput() {
  const [message, setMessage] = React.useState<string>("");
  const messageContext = useMessageContext();
  const authContext = useAuthenticatedContext();
  const playerContext = usePlayers();
  const sendMessage = () => {
    if (message.length === 0) return;
    // we need to check if the current message is prefixed with the '/all' delimeter.
    const prefix: string[] = message.split(" ");
    if (prefix[0] === "/all") {
      // I have all all message
      //lets create a new Message without the prefix
      const nMessage = prefix.slice(1);
      messageContext.sendAllMessage(nMessage.join(" "));
      setMessage("");
      return;
    }
    const me = playerContext.getPlayer(authContext.user.id)!; // force unwrapping is fine as it should be the current user. (if they are not there that is another problem).
    // I do not have an all message, I now need to send either a player or a host message based on the status of the user;
    if (me.isHost) {
      messageContext.sendHostMessage(message);
    } else {
      messageContext.sendPlayerMessage(message);
    }
    // All done reset the message
    setMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };
  return (
    <div className="h-100 w-100">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          aria-describedby="basic-addon1"
          value={message}
          onChange={(e: any) => {
            setMessage(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <span className="input-group-text" id="basic-addon1">
          <button
            className="btn btn-primary"
            onClick={() => {
              sendMessage();
            }}
          >
            <i className="bi bi-envelope-arrow-up-fill"></i>
          </button>
        </span>
      </div>
    </div>
  );
}
