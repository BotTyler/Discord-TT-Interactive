import React from "react";
import { AudioHandler } from "./AudioHandler";

export interface AudioProviderInterface {
  getQueue: () => string[];
  getCurrentIndex: () => number;
}

const AudioContext = React.createContext<AudioProviderInterface>({
  getQueue: (): string[] => {
    return [];
  },
  getCurrentIndex: (): number => {
    return 0;
  },
});

export function useAudio() {
  return React.useContext(AudioContext);
}

export function AudioContextProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<any>(null);
  const [isRefReady, setRefReady] = React.useState<boolean>(false);
  const getQueue = () => {
    if (!isRefReady) {
      console.warn("This was accessed before the ref was ready! >:(");
      return [];
    }
    return audioRef.current.getQueue();
  };

  const getCurrentIndex = () => {
    if (!isRefReady) {
      console.warn("This method was accessed before the ref was ready! >:(");
      return 0;
    }
    return audioRef.current.getCurrentIndex();
  };

  React.useEffect(() => {
    setRefReady(audioRef.current != null);
  }, [audioRef, audioRef.current]);

  return (
    <AudioContext.Provider
      value={{
        getQueue: getQueue,
        getCurrentIndex: getCurrentIndex,
      }}
    >
      <AudioHandler ref={audioRef} />
      {isRefReady ? children : <p>Audio Loading</p>}
    </AudioContext.Provider>
  );
}
