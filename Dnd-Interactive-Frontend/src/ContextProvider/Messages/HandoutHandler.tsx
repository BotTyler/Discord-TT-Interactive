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

  const getRandomX = (sidePadding?: number): number => {
    const width = window.innerWidth;
    const randomX = Math.floor(Math.random() * width);
    const padding = sidePadding ?? width * 0.25;

    if (randomX > width - padding) {
      return randomX - padding;
    } else if (randomX < padding) {
      return randomX + padding;
    }
    return randomX;
  };
  const getRandomY = (sidePadding?: number): number => {
    const height = window.innerHeight;
    const randomY = Math.floor(Math.random() * height);
    const padding = sidePadding ?? height * 0.25;
    if (randomY > height - padding) {
      return randomY - padding;
    } else if (randomY < padding) {
      return randomY + padding;
    }
    console.log(`${height}:${randomY}:${padding}`);

    return randomY;
  };

  return (
    <div>
      {handouts.map((val: HandoutInterface, index: number) => {
        return (
          <PopupWindow
            width={500}
            height={500}
            resizeable={true}
            startx={getRandomX()}
            starty={getRandomY()}
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
