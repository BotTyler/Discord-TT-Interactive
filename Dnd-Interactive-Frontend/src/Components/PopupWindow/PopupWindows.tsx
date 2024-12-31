import { MouseEvent, ReactNode, useCallback, useEffect, useState } from "react";

export default function PopupWindow({ children, onClose, width = 100, height = 200, resizeable = false, startx = 100, starty = 100 }: { children: ReactNode; onClose: () => void; width: number; height: number; resizeable?: boolean; startx?: number; starty?: number }) {
  const [top, setTop] = useState<number>(starty);
  const [left, setLeft] = useState<number>(startx);
  const [isMoving, setMoving] = useState<boolean>(false);

  const MouseUpCallback = useCallback((event: MouseEvent) => {
    setMoving(false);
  }, []);
  const MouseDownCallback = useCallback((event: MouseEvent) => {
    setMoving(true);
  }, []);

  useEffect(() => {
    const MouseDragCallback = (event: any) => {
      if (!isMoving) return;
      setTop((prev) => {
        return prev + event.movementY;
      });
      setLeft((prev) => {
        return prev + event.movementX;
      });
    };
    document.addEventListener("mousemove", MouseDragCallback);
    return () => {
      document.removeEventListener("mousemove", MouseDragCallback);
    };
  }, [isMoving]);

  return (
    <div className="border border-3 rounded-bottom overflow-hidden d-flex flex-column" style={{ userSelect: "none", width: `${width}px`, height: `${height}px`, position: "fixed", top: `${top}px`, left: `${left}px`, boxShadow: "0 6px 10px rgba(50,50,50, 1)", zIndex: 1000, resize: "both" }}>
      <div id="header" className="w-100 position-relative" style={{ height: "30px", borderBottom: "1px inset grey" }}>
        <button className="position-absolute btn btn-secondary d-flex justify-content-center align-items-center" style={{ top: 0, right: 0, left: 0, bottom: 0, borderRadius: 0 }} onMouseUp={MouseUpCallback} onMouseDown={MouseDownCallback}></button>
        <button
          className="close-button position-absolute btn btn-danger rounded-0"
          style={{ right: 0, top: 0, bottom: "-1px" }}
          onClick={() => {
            onClose();
          }}
        >
          &times;
        </button>
      </div>
      <div id="body" className="overflow-x-hidden overflow-y-auto bg-dark w-100 py-1" style={{ flex: "1 1 auto", height: "1px" }}>
        {children}
      </div>
    </div>
  );
}
