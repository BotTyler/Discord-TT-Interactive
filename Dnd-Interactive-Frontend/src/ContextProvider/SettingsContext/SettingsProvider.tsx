import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Accordion, Offcanvas } from "react-bootstrap";
import AssetManager from "../../Components/AssetManager/AssetManager";

export interface SettingsProviderInterface {
  getQueue: () => string[];
  getCurrentIndex: () => number;
}

const SettingsContext = createContext<SettingsProviderInterface>({
  getQueue: (): string[] => {
    return [];
  },
  getCurrentIndex: (): number => {
    return 0;
  },
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settingsRef = useRef<any>(null);
  const [settingsRefReady, setSettingsRefReady] = useState<boolean>(false);
  const [embeddedRefReady, setEmbeddedRefReady] = useState<boolean>(false);

  const getQueue = () => {
    if (!settingsRefReady) {
      console.warn("This was accessed before the ref was ready! >:(");
      return [];
    }
    return settingsRef.current.getQueue();
  };

  const getCurrentIndex = () => {
    if (!settingsRef) {
      console.warn("This method was accessed before the ref was ready! >:(");
      return 0;
    }
    return settingsRef.current.getCurrentIndex();
  };

  const handleEmbeddedRefReady = (status: boolean) => {
    setEmbeddedRefReady(status);
  }

  useEffect(() => {
    setSettingsRefReady(settingsRef.current != null);
  }, [settingsRef, settingsRef.current]);

  return (
    <SettingsContext.Provider
      value={{
        getQueue: getQueue,
        getCurrentIndex: getCurrentIndex,
      }}
    >
      <SettingsContainer embeddedRefReadyCallback={handleEmbeddedRefReady} ref={settingsRef} />
      {settingsRefReady && embeddedRefReady ? children : <p>Audio Loading</p>}
    </SettingsContext.Provider>
  );
}


const SettingsContainer = forwardRef(function SettingsContainer({ embeddedRefReadyCallback }: { embeddedRefReadyCallback: (status: boolean) => void }, ref: any) {
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({

  }));
  useEffect(() => {
    // NOTE: INCLUDE ANY REFS THAT NEED TO BE WAITED FOR HERE.
    // MAKE SURE TO INCLUDE THEM IN THE DEPS ARRAY.
    embeddedRefReadyCallback(true);
  }, []);

  return (<div className="position-relative">
    <div
      className="position-absolute text-center rounded-circle"
      style={{ top: "25px", right: "25px", width: "50px", height: "50px", border: "3px solid #131313", background: "#4a4a4a", color: "white", zIndex: "1000" }}
    >
      <i style={{ fontSize: "30px" }} className="bi bi-gear-wide-connected"
        onClick={() => {
          setShowSettingsPanel((prev) => {
            return !prev;
          });
        }}
      />

    </div>
    {/* Audio Handler has to be here as the accordion will unmount on close */}
    <Offcanvas show={showSettingsPanel} onHide={() => setShowSettingsPanel(false)}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Accordion defaultActiveKey="0" className="h-100 w-100 overflow-hidden d-flex flex-column">
          <Accordion.Item eventKey="0" className="d-flex flex-column" style={{ maxHeight: '750px' }}>
            <Accordion.Header>Asset Manager</Accordion.Header>
            <Accordion.Body className="overflow-auto" style={{ flex: '1 1 auto', height: '1px' }}>
              <AssetManager />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Offcanvas.Body>
    </Offcanvas>
  </div>)
});
