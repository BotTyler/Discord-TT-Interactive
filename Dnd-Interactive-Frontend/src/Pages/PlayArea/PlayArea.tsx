import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import Toolbar from "../../Components/Map/Toolbar/Toolbar";
import { usePlayers } from "../../ContextProvider/PlayersContext/PlayersContext";
import InteractiveMap from "../../Components/Map/InteractiveMap";
import PlayerSidePanel from "../../Components/SidePanel/Player/PlayerSidePanel";
import Loading from "../../Components/Loading";
import { DiceRoller } from "../../Components/DiceRoller/DiceRoller";
import { useGameState } from "../../ContextProvider/GameStateContext/GameStateProvider";
import { GameToolProvider } from "../../ContextProvider/GameToolProvider";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import React from "react";
import HostSidePanel from "../../Components/SidePanel/Host/HostSidePanel";
import { MapData } from "dnd-interactive-shared";
import { GameDrawingProvider } from "../../ContextProvider/GameDrawingProvider";
import DrawingToolbar from "../../Components/Map/Toolbar/DrawingToolbar";

/**
 * Component that represents the entire game area.
 */
export default function PlayArea() {
  const authContext = useAuthenticatedContext();
  const players = usePlayers();
  const gamestateContext = useGameState();
  const diceRollerRef: any = React.useRef(null);

  const [mapData, setMapData] = React.useState<MapData | undefined>(gamestateContext.getMap());
  function displaySidePanel() {
    const currentUserid = authContext.user.id;
    //if (players.getPlayer(currentUserid) === undefined || gamestateContext.getMap() === undefined) return <Loading />;
     return <HostSidePanel />;
    if (players.getPlayer(currentUserid)!.isHost) return <HostSidePanel />;
    return <PlayerSidePanel />;
  }

  React.useEffect(() => {
    const handleMapChange = (value: any) => {
      setMapData(value.detail.val);
    };

    window.addEventListener(`MapUpdate`, handleMapChange);
    return () => {
      window.removeEventListener(`MapUpdate`, handleMapChange);
    };
  }, []);

  return (
    <GameToolProvider>
      <GameDrawingProvider>
        <div className="w-100 h-100 overflow-auto p-0 g-0" style={{}}>
          <PanelGroup direction="horizontal" style={{ overflow: undefined }}>
            <Panel
              defaultSize={25}
              minSize={20}
              maxSize={70}
              style={{ overflow: undefined }}
              onResize={() => {
                if (diceRollerRef == undefined || diceRollerRef.current == undefined) return;
                diceRollerRef.current.refresh();
              }}
            >
              <PanelGroup direction="vertical" style={{ overflow: undefined }}>
                <Panel defaultSize={60}>{displaySidePanel()}</Panel>
                <PanelResizeHandle className="bg-primary" />
                <Panel
                  defaultSize={40}
                  minSize={10}
                  maxSize={50}
                  style={{ overflow: undefined }}
                  onResize={() => {
                    if (diceRollerRef == undefined || diceRollerRef.current == undefined) return;
                    diceRollerRef.current.refresh();
                  }}
                >
                  <DiceRoller fullScreen={false} ref={diceRollerRef} />
                </Panel>
              </PanelGroup>
            </Panel>
            <PanelResizeHandle className="bg-primary" />
            <Panel defaultSize={75}>
              <div className="h-100 position-relative">
                {/* Tool bar for DM tools */}
                <div
                  className="position-absolute"
                  style={{
                    zIndex: 999,
                    top: "10px",
                    left: "50%",
                    transform: "translate(-50%,0)",
                  }}
                >
                  <Toolbar />
                </div>

                {/* Tool bar for drawing tools */}
                <div
                  className="position-absolute"
                  style={{
                    zIndex: 999,
                    top: "50%",
                    right: "10px",
                    transform: "translate(0,-50%)",
                  }}
                >
                  <DrawingToolbar />
                </div>
                <div className="position-absolute" style={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  {mapData == undefined ? <div className="w-100 h-100" style={{ background: "grey", zIndex: 100 }}></div> : <InteractiveMap map={mapData} key={`interactiveMap`} />}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </GameDrawingProvider>
    </GameToolProvider>
  );
}
