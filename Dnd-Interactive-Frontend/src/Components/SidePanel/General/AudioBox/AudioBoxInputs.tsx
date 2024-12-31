import React from "react";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { getFileNameFromMinioString } from "../../../../Util/Util";

export default function AudioBoxInputs() {
  const authContext = useAuthenticatedContext();
  const [isNewSelected, setSelected] = React.useState<boolean>(false);
  const [knownAudioList, setKnownAudioList] = React.useState<string[]>([]);
  const [insertValue, setInsertValue] = React.useState<string>("");

  React.useEffect(() => {
    authContext.room.send("getAudioList");

    const audioListListener = authContext.room.onMessage("getAudioListResult", (val: any) => {
      setKnownAudioList(val);
    });

    return () => {
      audioListListener();
    };
  }, []);

  React.useEffect(() => {
    setInsertValue("");
  }, [isNewSelected]);
  return (
    <div className="w-100 h-auto">
      {/* New load button group */}
      <div className="btn-group w-100" role="group" aria-label="Basic example">
        <button
          type="button"
          className={`btn btn-primary ${isNewSelected ? "active" : ""}`}
          onClick={() => {
            setSelected(true);
          }}
        >
          New
        </button>
        <button
          type="button"
          className={`btn btn-primary ${!isNewSelected ? "active" : ""}`}
          onClick={() => {
            setSelected(false);
          }}
        >
          Load
        </button>
      </div>

      <div className="input-group w-100 h-auto">
        {/* <textarea className="form-control" aria-label="With textarea"></textarea> */}
        {isNewSelected ? (
          <input
            type="text"
            className="form-control"
            placeholder="Youtube Link"
            aria-label="Username"
            onChange={(val) => {
              setInsertValue((prev) => {
                return val.target.value;
              });
            }}
          />
        ) : (
          <select
            className={`form-select`}
            aria-label="Default select example"
            onChange={(e) => {
              setInsertValue(e.target.value);
            }}
          >
            <option value={""}>Select Audio</option>
            {knownAudioList.map((val: string, i: number) => {
              return (
                <option value={val} key={`KnownAudioList-${val}-${i}`}>
                  {getFileNameFromMinioString(val)}
                </option>
              );
            })}
          </select>
        )}
        <span className="input-group-text">
          <button
            onClick={async () => {
              var audioName = insertValue;
              if (audioName === "") return; // no audio was selected do not send anything to the server
              if (isNewSelected) {
                // make a request to the express endpoint to get the name of the audio
                const response = await authContext.client.http
                  .post(`/uploadAudio/${authContext.user.id}/youtube`, {
                    body: {
                      link: audioName,
                    },
                  })
                  .catch((e) => {
                    throw new Error(e);
                  });
                audioName = response.data.fileName;
              }

              authContext.room.send("AddAudio", { audioName: audioName });
              authContext.room.send("getAudioList");
            }}
          >
            S
          </button>
        </span>
      </div>
    </div>
  );
}
