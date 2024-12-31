import React from "react";
import { useAudio } from "../../../../ContextProvider/AudioContext/AudioProvider";
import AudioBoxInputs from "./AudioBoxInputs";
import AudioBoxItem from "./AudioBoxItem";
import { getFileNameFromMinioString } from "../../../../Util/Util";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";

export default function AudioBox() {
  const audioContext = useAudio();
  const authContext = useAuthenticatedContext();
  const [queue, setQueue] = React.useState<string[]>(audioContext.getQueue());
  const [currentIndex, setCurrentIndex] = React.useState<number>(audioContext.getCurrentIndex());
  React.useEffect(() => {
    const handleQueueChange = (val: any) => {
      setQueue(val.detail.val);
    };
    const handleCurrentIndexChange = (val: any) => {
      setCurrentIndex(val.detail.val);
    };

    window.addEventListener("update-audio-queueChange", handleQueueChange);
    window.addEventListener("update-audio-currentAudioIndex", handleCurrentIndexChange);

    return () => {
      window.removeEventListener("update-audio-queueChange", handleQueueChange);
      window.removeEventListener("update-audio-currentAudioIndex", handleCurrentIndexChange);
    };
  }, []);
  return (
    <div className="w-100 h-100 d-flex flex-column">
      {/* Add video to queue */}
      <div className="w-100">
        <AudioBoxInputs />
      </div>
      {/* Queue List */}
      <div className="container-fluid overflow-auto my-1" style={{ flex: "1 1 auto" }}>
        <ul className="list-group">
          {/* <li className="list-group-item active">An active item</li>
          <li className="list-group-item">A second item</li> */}
          {queue.map((val: string, index: number) => {
            // return <p className={`${index === currentIndex ? "active" : ""}`}>{val}</p>;
            return (
              <li className={`list-group-item list-group-item-action ${index === currentIndex ? "active" : ""}`} key={`AudioBoxItem-${val}-${index}`}>
                <AudioBoxItem
                  name={getFileNameFromMinioString(val)}
                  key={`AudioBoxItem-${val}-${index}`}
                  onClick={() => {
                    authContext.room.send("ChangeAudio", { index: index });
                  }}
                  onDelete={() => {
                    authContext.room.send("RemoveAudio", { audioName: val, index: index });
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
