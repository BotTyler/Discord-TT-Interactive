import React from "react";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import BootstrapSelect from "../SelectBootstrap/BootstrapSelect";
import MapUpload, { ClientMapDataInterface } from "../Map/MapUpload";
import { LoadSaveHistory } from "../../../src/shared/LoadDataInterfaces"
import { GameStateEnum } from "../../../src/shared/State"
import { useMessageContext } from "../../ContextProvider/Messages/MessageContextProvider";

export default function VersionHistory() {
  const authContext = useAuthenticatedContext();
  const [data, setData] = React.useState<LoadSaveHistory[]>([]);
  const [isMapUpload, setMapUpload] = React.useState<boolean>(false);
  const toastContext = useMessageContext();
  // const [isNewMapSelected, setIsNewMapSelected] = React.useState<boolean>(true);
  const onSelectCallback = React.useCallback(
    (index: number) => {
      if (index === -1) {
        // new map was selected handle this separately
        authContext.room.send("clearMap");

        // setIsNewMapSelected(true);
        return;
      }

      // setIsNewMapSelected(false)

      authContext.room.send("loadMap", { history_id: data[index].id, map_id: data[index].map });
    },
    [data]
  );

  React.useEffect(() => {
    authContext.room.send("getSaves", { user_id: authContext.user.id });
    const result = authContext.room.onMessage("getSavesResult", (data: LoadSaveHistory[]) => {
      setData(data);
    });

    return () => {
      result();
    };
  }, []);

  return (
    <div className="w-100 h-100 d-flex flex-column align-items-center">
      <BootstrapSelect
        data={data.map((val: LoadSaveHistory) => {
          return `${val.date.toLocaleDateString()} - ${val.date.toLocaleTimeString()}`;
        })}
        onSelectCallback={onSelectCallback}
      />
      <button
        type="button"
        className="btn btn-secondary mt-1"
        onClick={() => {
          setMapUpload(true);
        }}
      >
        New Map
      </button>
      {isMapUpload ? (
        <MapUpload
          callback={(data: ClientMapDataInterface | undefined) => {
            if (data === undefined) {
              setMapUpload(false);
              return;
            }
            toastContext.addToast("UPLOADING: ", "Data is uploading to the server.");
            // gamestateContext.setGameMap(data);
            authContext.room.send("setGameMap", data); // this may need to be changed
            authContext.room.send("setGameState", { gameState: GameStateEnum.HOSTPLAY });

            setMapUpload(false);
          }}
        />
      ) : (
        ""
      )}
    </div>
  );
}
