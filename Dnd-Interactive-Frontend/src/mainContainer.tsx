import ReactDOM from "react-dom/client";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import { ErrorBoundary } from "react-error-boundary";
import { SettingsProvider } from "./ContextProvider/AudioContext/SettingsProvider";
import { GameStateContextProvider } from "./ContextProvider/GameStateContext/GameStateProvider";
import { MessageContextProvider } from "./ContextProvider/Messages/MessageContextProvider";
import { PlayersContextProvider } from "./ContextProvider/PlayersContext/PlayersContext";
import { AuthenticatedContextProvider } from "./ContextProvider/useAuthenticatedContext";
import { ErrorHandlerProvider } from "./ErrorHandlerContext";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <div className="w-100 h-100" style={{ fontSize: "12px" }}>
    {/* <React.StrictMode> */}
    <ErrorBoundary
      fallback={<div>Something went wrong</div>}
      onError={(e) => {
        console.error(e);
      }}
    >
      <ErrorHandlerProvider>
        <AuthenticatedContextProvider>
          <SettingsProvider>
            <PlayersContextProvider>
              <MessageContextProvider>
                <GameStateContextProvider />
              </MessageContextProvider>
            </PlayersContextProvider>
          </SettingsProvider>
        </AuthenticatedContextProvider>
      </ErrorHandlerProvider>
    </ErrorBoundary>
    {/* </React.StrictMode> */}
  </div>
);
