import { useEffect, useState } from "react";
import PopupWindow from "../../Components/PopupWindow/PopupWindows";
import { useAuthenticatedContext } from "../useAuthenticatedContext";

interface HandoutInterface {
  id: string;
  imageUrl: string;
}

export default function HandoutHandler() {
  const authContext = useAuthenticatedContext();
  const [handouts, setHandouts] = useState<HandoutInterface[]>([]);
  useEffect(() => {
    const HandoutListener = authContext.room.onMessage("HandoutAdd", (data: { id: string; imageUrl: string }) => {
      setHandouts((prev) => {
        return [...prev, { id: data.id, imageUrl: data.imageUrl }];
      });
    });

    return () => {
      HandoutListener();
    };
  }, [authContext.room]);

  return (
    <div>
      {handouts.map((val: HandoutInterface, index: number) => {
        return (
          <PopupWindow
            width={window.innerWidth / 3}
            height={window.innerHeight / 2}
            resizeable={true}
            startx={window.innerWidth / 2}
            starty={window.innerHeight / 2}
            key={`Handout-${val.id}`}
            onClose={() => {
              setHandouts((prev) => {
                return prev.filter((x: HandoutInterface) => val.id !== x.id);
              });
            }}
          >
            <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
              <img className="img-fluid" src={`/colyseus/getImage/${val.imageUrl}`} style={{ maxHeight: "100%" }} />
            </div>
          </PopupWindow>
        );
      })}
    </div>
  );
}
