import React from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import HandoutHandler from "./HandoutHandler";
import { MessageHandler, MessageInterface } from "./MessageHandler";
import { ToastListHandler } from "./ToastListHandler";
import { TOAST_LEVEL } from "./Toast";

/**
 * Context component that will allow other component to call methods and add a toast to the screen.
 */
export function MessageContextProvider({ children }: { children: React.ReactNode }) {
  const authContext = useAuthenticatedContext();
  const toastListRef = React.useRef<any>(null);
  const [toastRefReady, setToastRefReady] = React.useState<boolean>(false);
  const messageRef = React.useRef<any>(null);
  const [messageRefReady, setMessageRefReady] = React.useState<boolean>(false);

  const addToast = React.useCallback(
    (title: string, message: any, level: TOAST_LEVEL) => {
      if (toastListRef == undefined) {
        console.log("Toast Ref is not def");
        return;
      }

      toastListRef.current.addToast(title, message, level);
    },
    [toastListRef]
  ); // Use useCallback to avoid unnecessary re-renders

  const sendPlayerMessage = (message: string) => {
    authContext.room.send("BroadcastMessage", { message: message, type: "player" });
  };
  const sendHostMessage = (message: string) => {
    authContext.room.send("BroadcastMessage", { message: message, type: "host" });
  };
  const sendAllMessage = (message: string) => {
    authContext.room.send("BroadcastMessage", { message: message, type: "all" });
  };
  const getAllMessage = () => {
    if (messageRef == undefined) {
      console.error("Messages not init");
      return;
    }

    return messageRef.current.getAllMessage();
  };

  React.useEffect(() => {
    setToastRefReady(toastListRef.current != null);
  }, [toastListRef, toastListRef.current]);

  React.useEffect(() => {
    setMessageRefReady(messageRef.current != null);
  }, [messageRef, messageRef.current]);

  return (
    <ToastContext.Provider value={{ addToast: addToast, sendPlayerMessage: sendPlayerMessage, sendHostMessage: sendHostMessage, sendAllMessage: sendAllMessage, getAllMessage: getAllMessage }}>
      <ToastListHandler ref={toastListRef} />
      <MessageHandler ref={messageRef} />
      <HandoutHandler />
      {toastRefReady && messageRefReady ? children : <p>Message Context Loading</p>}
    </ToastContext.Provider>
  );
}
interface ToastContextInterface {
  addToast: (title: string, message: any, level: TOAST_LEVEL) => void;
  getAllMessage: () => MessageInterface[];
  sendPlayerMessage: (message: string) => void;
  sendHostMessage: (message: string) => void;
  sendAllMessage: (message: string) => void;
}
const ToastContext = React.createContext<ToastContextInterface>({
  addToast: () => {
    console.error("method not implemented yet");
  },
  sendPlayerMessage: (message: string) => {
    console.error("method not implemented yet");
  },
  sendHostMessage: (message: string) => {
    console.error("method not implemented yet");
  },
  sendAllMessage: (message: string) => {
    console.error("method not implemented yet");
  },
  getAllMessage: () => {
    return [];
  },
});
export function useMessageContext() {
  return React.useContext(ToastContext);
}
