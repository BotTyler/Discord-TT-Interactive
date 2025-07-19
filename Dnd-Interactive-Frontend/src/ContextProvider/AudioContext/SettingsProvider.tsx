import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Accordion, Col, Image, Offcanvas, Row } from "react-bootstrap";
import { getFileNameFromMinioString } from "../../Util/Util";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { AudioHandler } from "./AudioHandler";

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
  const audioRef = useRef<any>(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    //getAllMessage(): MessageInterface[] {
    //  return allMessage;
    //},
    getQueue() {
      if (!audioRef.current) {
        console.warn("This was accessed before the ref was ready! >:(");
        return [];
      }
      return audioRef.current.getQueue();
    },
    getCurrentIndex() {
      if (!audioRef.current) {
        console.warn("This method was accessed before the ref was ready! >:(");
        return 0;
      }
      return audioRef.current.getCurrentIndex();
    }

  }));
  useEffect(() => {
    const audioRefReady = audioRef.current != null;

    embeddedRefReadyCallback(audioRefReady);
  }, [audioRef]);

  return (<div className="position-relative">
    <div
      className="position-absolute text-center rounded-circle"
      style={{ top: "25px", right: "25px", width: "50px", height: "50px", border: "3px solid #131313", background: "#4a4a4a", color: "white", zIndex: "1000" }}
    >
      <i style={{ fontSize: "30px" }} className="bi bi-gear-wide-connected"
        onClick={() => {
          console.log("onclick proess icon");
          setShowSettingsPanel((prev) => {
            return !prev;
          });
        }}
      />

    </div>
    {/* Audio Handler has to be here as the accordion will unmount on close */}
    <AudioHandler ref={audioRef} />
    <Offcanvas show={showSettingsPanel} onHide={() => setShowSettingsPanel(false)}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Settings</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Accordion defaultActiveKey="0" className="h-100 w-100 overflow-hidden d-flex flex-column">
          <Accordion.Item eventKey="0">
            <Accordion.Header>AudioHandler</Accordion.Header>
            <Accordion.Body>
              <AudioDisplayer />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1" className="d-flex flex-column" style={{ maxHeight: '750px' }}>
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

function AssetManager() {
  const authContext = useAuthenticatedContext();
  const [imgList, setImgList] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    const handleImageListResponse = (val: any) => {
      console.log("image response");
      console.log(val);
      setImgList(val.map((obj: any) => {
        return obj.image_name;
      }));

    }
    const imageListResponseListener = authContext.room.onMessage("getImageListResult", handleImageListResponse);

    authContext.room.send("getImageList");

    return () => {
      imageListResponseListener();
    }
  }, []);

  return <div className="w-100 h-auto">
    <Row direction="horizontal" gap={3}>
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
      {imgList ? imgList.map((imgUrl) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
    </Row>
  </div>

}


function AudioDisplayer() {

  return (
    <div className="w-100 h-auto">
      Audio AudioDisplayer
    </div>
  )
}
