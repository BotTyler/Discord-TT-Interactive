import { GameStateEnum, LoadCampaign, LoadSaveHistory, MapData, Player } from "dnd-interactive-shared";
import { useEffect, useState } from "react";
import InteractiveMap from "../../Components/Map/InteractiveMap";
import MapUpload, { ClientMapDataInterface } from "../../Components/Map/MapUpload";
import PlayerBanner from "../../Components/PlayerBanner/PlayerBanner";
import { useGameState } from "../../ContextProvider/GameStateContext/GameStateProvider";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
export default function HostMM({ otherPlayers }: { otherPlayers: Player[] }) {
  const authContext = useAuthenticatedContext();
  function removeHost() {
    authContext.room.send("removeHost");
  }
  const [campaignList, setCampaignList] = useState<LoadCampaign[]>([]);
  const [curCampaign, setCurCampaign] = useState<LoadCampaign | undefined>(undefined);
  const [isMapUpload, setMapUpload] = useState<boolean>(false);

  useEffect(() => {
    const handleResultCallback = authContext.room.onMessage("CampaignResult", (val: LoadCampaign[]) => {
      setCampaignList(val);
    });
    authContext.room.send("getCampaigns");

    return () => {
      handleResultCallback();
    };
  }, [authContext.room]);
  return (
    <div className="p-0 row m-0 h-100 pt-1">
      {/* Main Content */}
      <div className="col-10 h-100 d-flex flex-column">
        {/* Campaign Select */}
        <div className="h-auto rounded-3 p-1 pb-2 px-3 border border-2 border-secondary bg-dark-subtle">
          <div className="w-100 h-auto d-flex justify-content-center mb-1 h3">
            <p className="m-0">Campaign Select</p>
          </div>
          <div className="p-0 overflow-hidden container-fluid m-0 rounded-4 border border-2 border-secondary" style={{ height: "150px", backgroundColor: `var(--bs-light-bg-subtle)` }}>
            <ul className="list-group list-group-horizontal overflow-x-auto w-100 h-100 user-select-none">
              {campaignList.map((val: LoadCampaign) => {
                return (
                  <li
                    className={`list-group-item h-100 ${val.name === curCampaign?.name ? "active" : ""}`}
                    style={{ minWidth: "fit-content" }}
                    onClick={() => {
                      setCurCampaign(val);
                    }}
                    key={`Campaign-List-Element-${val.id}`}
                  >
                    <CampaignComponent imageUrl={val.image_name} name={val.name} />
                  </li>
                );
              })}
              <li
                className={`list-group-item h-100`}
                style={{ minWidth: "fit-content" }}
                onClick={() => {
                  setCurCampaign(undefined);
                  setMapUpload(true);
                }}
                key={`Campaign-List-Element-New-Map`}
              >
                <CampaignComponent imageUrl={`Assets/placeholder.png`} name={`New Map`} />
              </li>
            </ul>
          </div>
        </div>
        {/* Buttons and Map preview */}
        <div className="row p-0 w-100 m-0 py-3 pt-2 justify-content-between" style={{ flex: "1 1 auto", height: "1px" }}>
          {/* Button Group */}
          <div className="col-4 p-0 pt-1 h-100 overflow-hidden border border-2 border-secondary rounded-3" style={{ backgroundColor: `var(--bs-light-bg-subtle)` }}>
            <VersionHistory campaign={curCampaign} key={"Campaign-Version-History"} />
          </div>

          {/* Map Preview */}
          <div className="col-8 p-0 ps-3">
            <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center border border-2 border-secondary rounded-3 p-0 h-100 overflow-hidden" style={{ backgroundColor: `var(--bs-light-bg-subtle)` }}>
              <MapPreviewComponent />
            </div>
          </div>
        </div>
      </div>
      {/* Player list */}
      <div className="col-2 h-100 p-0 pb-3">
        <div className="w-100 h-100 d-flex flex-column border border-2 border-secondary rounded-3 overflow-hidden" style={{ backgroundColor: `var(--bs-light-bg-subtle)` }}>
          <div className="w-100 h-auto">
            <button
              className="btn btn-primary w-100 h-auto rounded-0"
              onClick={() => {
                removeHost();
              }}
            >
              Become Mortal!!
            </button>
          </div>

          <div className="w-100 d-flex flex-column overflow-auto border-2 border-top border-secondary" style={{ height: "1px", flex: "1 1 auto" }}>
            <HostPlayerListComponent players={otherPlayers} />
          </div>
        </div>
      </div>
      {isMapUpload ? (
        <MapUpload
          callback={(data: ClientMapDataInterface | undefined) => {
            if (data === undefined) {
              setMapUpload(false);
              return;
            }
            // gamestateContext.setGameMap(data);
            authContext.room.send("setGameMap", data); // this may need to be changed

            setMapUpload(false);
          }}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export function CampaignComponent({ name, imageUrl }: { name: string; imageUrl: string }) {
  const [uName, setName] = useState<string>(name);
  const [uImageUrl, setImageUrl] = useState<string>(imageUrl);

  useEffect(() => {
    setName(name);
  }, [name]);

  useEffect(() => {
    setImageUrl(imageUrl);
  }, [imageUrl]);
  return (
    <div className="w-100 h-100">
      {/* Image */}
      <div className="w-100 h-75 d-flex justify-content-center">
        <img className="img-fluid h-100" src={uName === "New Map" ? `${uImageUrl}` : `/colyseus/getImage/${uImageUrl}`} />
      </div>

      {/* Name */}
      <div className="w-100 h-25 d-flex justify-content-center align-items-center">
        <p className="m-0">{uName}</p>
      </div>
    </div>
  );
}

export function VersionHistory({ campaign }: { campaign: LoadCampaign | undefined }) {
  const [versionHistoryList, setVersionHistoryList] = useState<LoadSaveHistory[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number>(-1);
  const authContext = useAuthenticatedContext();
  useEffect(() => {
    const historyListener = authContext.room.onMessage("CampaignVersionHistoryResult", (message: LoadSaveHistory[]) => {
      setVersionHistoryList(message);
    });

    return () => {
      historyListener();
    };
  }, [authContext.room]);
  useEffect(() => {
    if (campaign === undefined) {
      setVersionHistoryList([]);
      setSelectedVersion(-1);
      return;
    }
    setSelectedVersion(-1);
    authContext.room.send("getVersionsByCampaign", { campaign_id: campaign.id });
  }, [campaign]);
  return (
    <div className="w-100 h-100 d-flex flex-column">
      <p className="h5 text-center">Version Select</p>
      <div style={{ flex: "1 1 auto", height: "1px" }} className="overflow-auto border-2 border-top boderder-dark-subtle">
        <ul className="list-group rounded-0">
          {versionHistoryList.map((val, index) => {
            return (
              <li
                className={`list-group-item user-select-none ${selectedVersion === index ? "active" : ""}`}
                key={`Version-History-Item-${val.id}`}
                onClick={() => {
                  setSelectedVersion(index);

                  if (index === -1) {
                    // new map was selected handle this separately
                    authContext.room.send("clearMap");
                    return;
                  }

                  // setIsNewMapSelected(false)

                  authContext.room.send("loadMap", { history_id: +versionHistoryList[index].id, map_id: +versionHistoryList[index].map });
                }}
              >
                {val.date.toLocaleString()}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function MapPreviewComponent() {
  const gamestateContext = useGameState();
  const authContext = useAuthenticatedContext();
  const [mapData, setMapData] = useState<MapData | undefined>(gamestateContext.getMap());

  useEffect(() => {
    const handleMapChange = (value: any) => {
      setMapData(value.detail.val);
    };

    window.addEventListener(`MapUpdate`, handleMapChange);
    return () => {
      window.removeEventListener(`MapUpdate`, handleMapChange);
    };
  }, []);

  return (
    <div className="h-100 w-100 d-flex flex-column">
      <div className="btn-group w-100 h-auto" role="group" aria-label="Basic example">
        <button
          type="button"
          className={`btn btn-primary rounded-0`}
          onClick={() => {
            authContext.room.send("setGameState", {
              gameState: GameStateEnum.HOSTPLAY,
            });
          }}
          disabled={mapData == null}
        >
          Preview
        </button>
        <button
          type="button"
          className={`btn btn-primary rounded-0`}
          onClick={() => {
            authContext.room.send("setGameState", {
              gameState: GameStateEnum.ALLPLAY,
            });
          }}
          disabled={mapData == null}
        >
          Start
        </button>
      </div>
      <div style={{ flex: "1 1 auto", height: "1px" }} className="position-relative">
        <div style={{ top: 0, bottom: 0, left: 0, right: 0, zIndex: 100 }} className="position-absolute">
          <div className="h-100 w-100" style={{ userSelect: "none" }}>
            {/* Interactive Map */}

            {mapData == undefined ? <div className="w-100 h-100" style={{ background: "grey", zIndex: 100 }}></div> : <InteractiveMap map={mapData} key={`interactiveMap-preview-hostmm`} />}
          </div>
        </div>
        <div style={{ top: 0, bottom: 0, left: 0, right: 0, zIndex: 101 }} className="position-absolute"></div>
      </div>
    </div>
  );
}

export function HostPlayerListComponent({ players }: { players: Player[] }) {
  const [playerList, setPlayers] = useState<Player[]>(players);
  useEffect(() => {
    setPlayers(players);
  }, [players]);
  return (
    <ul className="list-group rounded-0">
      {playerList.map((val) => {
        return (
          <li className="list-group-item" style={{ maxHeight: "200px" }} key={`HostMM-PlayerBanner-li-${val.userId}`}>
            <PlayerBanner hostOnClick={() => { }} isMain={false} player={val} key={`HostMM-PlayerBanner-Banner-${val.userId}`} />
          </li>
        );
      })}
    </ul>
  );
}
