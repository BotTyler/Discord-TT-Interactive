import React, { useImperativeHandle } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { Audio } from "dnd-interactive-shared";

export const AudioHandler = React.forwardRef(function AudioHandler({}: {}, ref: any) {
  const [gameAudio, setGameAudio] = React.useState<Audio>();

  const [currentAudioIndex, setAudioIndex] = React.useState<number>(0);
  const [queue, setQueue] = React.useState<string[]>([]);
  const [currentTimestamp, setTimestamp] = React.useState<number>(0);
  const [isPlaying, setPlaying] = React.useState<boolean>(false);

  const [showAudioPlayer, setShowAudioPlayer] = React.useState<boolean>(false);

  const audioPlayerRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (audioPlayerRef == null || audioPlayerRef.current == null) return;
    audioPlayerRef.current.volume = 0.05;
  }, [audioPlayerRef]);

  const authContext = useAuthenticatedContext();
  useImperativeHandle(
    ref,
    () => ({
      getQueue() {
        return queue;
      },
      getCurrentIndex() {
        return currentAudioIndex;
      },
    }),
    [currentAudioIndex, queue]
  );

  // below effects are used to emit events when the value is finalized
  const emitFieldChangeEvent = (field: string, value: any) => {
    const event = new CustomEvent(`update-audio-${field}`, {
      detail: { val: value },
    });
    window.dispatchEvent(event);
  };

  React.useEffect(() => {
    emitFieldChangeEvent("currentAudioIndex", currentAudioIndex);
  }, [currentAudioIndex]);
  React.useEffect(() => {
    if (audioPlayerRef.current != null) {
      const currentTime = audioPlayerRef.current.currentTime;
      if (Math.abs(currentTime - currentTimestamp) > 5) {
        audioPlayerRef.current.currentTime = currentTimestamp;
      }
    }
    emitFieldChangeEvent("currentTimestamp", currentTimestamp);
  }, [currentTimestamp]);
  React.useEffect(() => {
    setAudioPlayerState();
    emitFieldChangeEvent("isPlaying", isPlaying);
  }, [isPlaying]);

  React.useEffect(() => {
    emitFieldChangeEvent("queueChange", queue);
  }, [queue]);

  React.useEffect(() => {
    const handleGameAudio = authContext.room.state.listen("gameAudio", (value: Audio) => {
      setGameAudio(value);
    });

    return () => {
      handleGameAudio();
    };
  }, [authContext.room]);
  React.useEffect(() => {
    if (gameAudio == null || gameAudio.currentAudioIndex == null) return;
    const handleCurrentVideoIndex = gameAudio.listen("currentAudioIndex", (value: number) => {
      setAudioIndex(value);
    });
    const handleTimestamp = gameAudio.listen("currentTimestamp", (value: number) => {
      setTimestamp(value);
    });

    const handlePlaying = gameAudio.listen("isPlaying", (value: boolean) => {
      setPlaying(value);
    });

    // handle adding a deleting from the audio queue
    // const handleQueueAdd = gameAudio.queue.onAdd((value: string) => {
    //   console.log(`adding: ${value}`);

    //   setQueue((prev) => {
    //     return [...prev, value];
    //   });
    // });

    // const handleQueueDelete = gameAudio.queue.onRemove((val: string, key: number) => {
    //   console.log(`Removing: ${val}::${key}`);
    //   setQueue((prev) => {
    //     return prev.filter((value: string, index: number) => {
    //       return index !== key;
    //     });
    //   });
    // });

    // For some reason colyseus made the ArrayScema and over complicated map.
    const handleQueueChange = gameAudio.listen("queue", (value: any) => {
      setQueue((prev) => {
        const array = [...value.$items].map((val) => {
          return val[1];
        });

        return array;
      }); // set to empty array, OnAdd should handle the inserts.
    });

    return () => {
      handleCurrentVideoIndex();
      handleTimestamp();
      handlePlaying();
      // handleQueueAdd();
      // handleQueueDelete();
      handleQueueChange();
    };
  }, [authContext.room, gameAudio]);

  const setAudioPlayerState = () => {
    if (audioPlayerRef.current == null) return;
    if (isPlaying) {
      audioPlayerRef.current.play();
    } else {
      audioPlayerRef.current.pause();
    }
  };

  return (
    <div className="position-relative">
      <div
        className="position-absolute text-center rounded-circle"
        style={{ top: "25px", right: "25px", width: "50px", height: "50px", border: "3px solid #131313", background: "#4a4a4a", color: "white", zIndex: "1000" }}
        onClick={() => {
          setShowAudioPlayer((prev) => {
            return !prev;
          });
        }}
      >
        <i style={{ fontSize: "30px" }} className="bi bi-volume-up-fill" />

        <div className={`h-auto w-auto ${showAudioPlayer ? "" : "d-none"} position-absolute`} style={{ right: "0px", top: "120%" }}>
          <audio
            src={`/colyseus/getAudio/${queue[currentAudioIndex]}`}
            controlsList="nodownload noplaybackrate"
            controls
            ref={audioPlayerRef}
            onPlay={(e) => {
              // from pause to play.
              if (!isPlaying) authContext.room.send("PlayAudio");
              setAudioPlayerState();
            }}
            onPause={(e) => {
              if (isPlaying) authContext.room.send("PauseAudio");

              setAudioPlayerState();
            }}
          />
        </div>
      </div>
    </div>
  );
});
