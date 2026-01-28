import React from "react";
import { useMessageContext } from "./ContextProvider/Messages/MessageContextProvider";
import { TOAST_LEVEL } from "./ContextProvider/Messages/Toast";

export function ErrorHandlerProvider({ children }: { children: React.ReactNode }) {
  const toastContext = useMessageContext();
  // Example of handling global errors
  // Set up global error handler

  const handleCustomError = React.useCallback((message: string) => {
    throw new Error(message);
  }, []); // Use useCallback to avoid unnecessary re-renders  React.useEffect(() => {

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error.hasBeenCaught !== undefined) {
        return false;
      }
      event.error.hasBeenCaught = true;
      toastContext.addToast("ERROR", event.message.toString(), TOAST_LEVEL.ERROR);
      event.preventDefault();
      return true;
    };
    window.addEventListener("error", handleError);

    // Cleanup the error handler on component unmount
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, [toastContext]);
  return <ErrorContext.Provider value={{ handleError: handleCustomError }}>{children}</ErrorContext.Provider>;
}

interface ErrorContextInterface {
  handleError: (message: string) => void;
}

const ErrorContext = React.createContext<ErrorContextInterface>({
  handleError: () => {
    console.error("class not implemented yet");
  },
});

export function useErrorContext() {
  return React.useContext(ErrorContext);
}
