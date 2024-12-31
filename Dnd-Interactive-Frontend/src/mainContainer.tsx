import React from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap-icons/font/bootstrap-icons.css";
import { MessageContextProvider } from "./ContextProvider/Messages/MessageContextProvider";
import { ErrorHandlerProvider } from "./ErrorHandlerContext";
import { AuthenticatedContextProvider, useAuthenticatedContext } from "./ContextProvider/useAuthenticatedContext";
import { PlayersContextProvider } from "./ContextProvider/PlayersContext/PlayersContext";
import { GameStateContextProvider } from "./ContextProvider/GameStateContext/GameStateProvider";
import { ErrorBoundary } from "react-error-boundary";
import { AudioContextProvider } from "./ContextProvider/AudioContext/AudioProvider";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <>
    {/* <React.StrictMode> */}
    <ErrorBoundary
      fallback={<div>Something went wrong</div>}
      onError={(e) => {
        console.error(e);
      }}
    >
      <ErrorHandlerProvider>
        <AuthenticatedContextProvider>
          <AudioContextProvider>
            <PlayersContextProvider>
              <MessageContextProvider>
                <GameStateContextProvider />
              </MessageContextProvider>
            </PlayersContextProvider>
          </AudioContextProvider>
        </AuthenticatedContextProvider>
      </ErrorHandlerProvider>
    </ErrorBoundary>
    {/* </React.StrictMode> */}
  </>
);
